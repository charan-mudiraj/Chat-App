import {
  VideoCameraIcon,
  MicrophoneIcon,
  VideoCameraSlashIcon,
  PhoneIcon,
  UserCircleIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";
import MicrophoneSlashIcon from "../Components/MicrophoneSlashIcon";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  CallType,
  IncommingCall,
  Room,
  SideScreenSchema,
  User,
} from "../Components/types";
import { isSideScreenActiveAtom, sideScreenAtom } from "../atoms/atom";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  Unsubscribe,
  updateDoc,
} from "firebase/firestore";
import { DB } from "../firestore/firestore";
import { createRoom, deleteRoom, joinRoom } from "../Components/Utils";

export default function Call({ classes }: { classes: string }) {
  const [isVideo, setIsVideo] = useState<boolean>(true);
  const [isAudio, setIsAudio] = useState<boolean>(true);
  const [currentSideScreen, setCurrentSideScreen] =
    useRecoilState<SideScreenSchema>(sideScreenAtom);
  const setIsSideScreenActive = useSetRecoilState<boolean>(
    isSideScreenActiveAtom
  );
  const [callStatus, setCallStatus] = useState<string>(
    currentSideScreen.isCaller ? "Calling..." : "On Call"
  );
  const localMediaRef = useRef<HTMLVideoElement | null>(null);
  const remoteMediaRef = useRef<HTMLVideoElement | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [onCall, setOnCall] = useState<Boolean>(
    currentSideScreen.isCaller ? false : true
  );
  const callRingTimeLimit = 30000;
  let peerConnection: RTCPeerConnection = null;
  let localStream: MediaStream = null;
  let remoteStream: MediaStream = null;
  const [videoTrack, setVideoTrack] = useState(null);
  const [audioTrack, setAudioTrack] = useState(null);

  const endCall = async () => {
    setCallStatus("Ending Call...");
    // stop accessing the media devices
    if (localMediaRef.current && localMediaRef.current.srcObject) {
      const stream = localMediaRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    if (currentSideScreen.isCaller && !onCall) {
      // update the incomming call ("isIncomming") at recipient to "false"
      await updateDoc(doc(DB, "users", currentSideScreen.userId), {
        incommingCall: {
          isIncomming: false,
        },
      });
    }
    if (roomId) {
      deleteRoom(roomId);
    }
    setTimeout(() => {
      setCurrentSideScreen((curr) => {
        return {
          ...curr,
          onCall: false,
        };
      });
      if (!currentSideScreen.isCaller) {
        setIsSideScreenActive(false);
      }
    }, 1000);
  };

  const getMedia = () => {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({
          video: currentSideScreen.callType === CallType.Video,
          audio: true,
        })
        .then((stream) => {
          if (localMediaRef && localMediaRef.current)
            localMediaRef.current.srcObject = stream;
          localStream = stream;
          remoteStream = new MediaStream();
          if (remoteMediaRef && remoteMediaRef.current)
            remoteMediaRef.current.srcObject = remoteStream;
          resolve("Got the media");
        })
        .catch(() => {
          reject("Failed to get the media");
        });
    });
  };

  // useEffect for caller
  useEffect(() => {
    if (!currentSideScreen.isCaller) return;
    let callTimeout: NodeJS.Timeout, endTimeout: NodeJS.Timeout;
    let unsubRecipient: Unsubscribe, unsubRoom: Unsubscribe;
    const setIncommingCall = async () => {
      const call: IncommingCall = {
        isIncomming: true,
        isRejected: false,
        isAccepted: false,
        callType: currentSideScreen.callType,
        callerId: window.localStorage.getItem("chatapp-user-id") as string,
        roomId: "",
      };
      await updateDoc(doc(DB, "users", currentSideScreen.userId), {
        incommingCall: call,
      });
    };

    (async () => {
      try {
        await getMedia();
        // get online status of recipient
        const snapshot = await getDoc(
          doc(DB, "users", currentSideScreen.userId)
        );
        if (snapshot.exists()) {
          const recipient = snapshot.data() as User;
          if (recipient.isOnline) {
            // make a call
            setIncommingCall();
            setCallStatus("Ringing...");
            // listen to "isRejected" and "isAccepted" in recipient's profile
            // (to call endCall() if "isRejected" is made true, or set call-status as "On Call" if "isAccepted" is made false, by recipient)
            unsubRecipient = onSnapshot(
              doc(DB, "users", currentSideScreen.userId),
              async (snapshot) => {
                if (snapshot.exists()) {
                  const recipient = snapshot.data() as User;
                  if (recipient.incommingCall.isRejected) {
                    // when the call is rejected by recipient
                    setCallStatus(
                      `${currentSideScreen.name} rejected the Call`
                    );
                    endTimeout = setTimeout(endCall, 2000);
                    unsubRecipient();
                  }
                  if (recipient.incommingCall.isAccepted) {
                    // when call is accepted by recipient
                    if (callTimeout) clearTimeout(callTimeout);
                    setOnCall(true);
                    setCallStatus("On Call");
                    // create room
                    const newRoomRef = doc(collection(DB, "rooms"));
                    const tracks = await createRoom(
                      newRoomRef,
                      peerConnection,
                      localStream,
                      remoteStream
                    );
                    setVideoTrack(tracks.videoTrack);
                    setAudioTrack(tracks.audioTrack);
                    await updateDoc(
                      doc(DB, "users", currentSideScreen.userId),
                      {
                        incommingCall: { roomId: newRoomRef.id },
                      }
                    );
                    setRoomId(newRoomRef.id);
                    // listen to "onCall" in the room, to end the call when reciever makes it false
                    unsubRoom = onSnapshot(
                      doc(DB, "rooms", newRoomRef.id),
                      (snapshot) => {
                        if (snapshot.exists()) {
                          const currentRoom = snapshot.data() as Room;
                          if (!currentRoom.onCall) {
                            setCallStatus(
                              `${currentSideScreen.name} have ended the call`
                            );
                            endTimeout = setTimeout(() => {
                              endCall();
                              unsubRoom();
                            }, 1000);
                          }
                        }
                      }
                    );
                    unsubRecipient();
                  }
                }
              }
            );
            // end call if not picked up for "callRingTimeLimit" seconds
            callTimeout = setTimeout(() => {
              setCallStatus(currentSideScreen.name + " didn't pickup the call");
              endTimeout = setTimeout(endCall, 2000);
            }, callRingTimeLimit);
          } else {
            // when recipient is offline
            setCallStatus(currentSideScreen.name + " is offline");
            endTimeout = setTimeout(endCall, 2000);
          }
        }
      } catch (err) {
        // when media devices are not allowed to be accessed
        if (err.name === "NotAllowedError") {
          setCallStatus("Media Access Denied");
        }
        endTimeout = setTimeout(endCall, 2000);
      }
    })();

    return () => {
      if (callTimeout) clearTimeout(callTimeout);
      if (endTimeout) clearTimeout(endTimeout);
      if (unsubRecipient) unsubRecipient();
      if (unsubRoom) unsubRoom();
    };
  }, []);

  // useEffect for reciever
  useEffect(() => {
    if (currentSideScreen.isCaller) return;
    let unsubRoom: Unsubscribe;
    let endTimeout: NodeJS.Timeout;
    getDoc(
      doc(DB, "users", window.localStorage.getItem("chatapp-user-id"))
    ).then((snapshot) => {
      if (snapshot.exists()) {
        const currentUser = snapshot.data() as User;
        if (currentUser.incommingCall.roomId) {
          setRoomId(currentUser.incommingCall.roomId);
          getMedia().then(async () => {
            const tracks = await joinRoom(
              currentUser.incommingCall.roomId,
              peerConnection,
              localStream,
              remoteStream
            );
            setVideoTrack(tracks.videoTrack);
            setAudioTrack(tracks.audioTrack);
            // listen to "onCall" in the room, to end the call when caller makes it false
            unsubRoom = onSnapshot(
              doc(DB, "rooms", currentUser.incommingCall.roomId),
              (snapshot) => {
                if (snapshot.exists()) {
                  const currentRoom = snapshot.data() as Room;
                  if (onCall && !currentRoom.onCall) {
                    setCallStatus(
                      `${currentSideScreen.name} have ended the call`
                    );
                    endTimeout = setTimeout(() => {
                      endCall();
                      unsubRoom();
                    }, 1000);
                  }
                }
              }
            );
          });
        }
      }
    });
    return () => {
      if (unsubRoom) unsubRoom();
      if (endTimeout) clearTimeout(endTimeout);
    };
  }, []);

  return (
    <div
      className={
        "flex flex-col w-screen chat-pattern bg-repeat bg-contain relative" +
        " " +
        classes
      }
    >
      <div className="flex flex-col items-center justify-center gap-2 h-full w-full relative">
        {!(currentSideScreen.callType === CallType.Video && onCall) && (
          <>
            {currentSideScreen.imageUrl ? (
              <img
                src={currentSideScreen.imageUrl}
                className="h-40 rounded-full"
              />
            ) : (
              <UserCircleIcon className="h-[28%] border-white border-2 rounded-full" />
            )}
            <div className="flex flex-col gap-3 items-center">
              <p className="text-2xl font-semibold text-center">
                {currentSideScreen.name}
              </p>
              <div>{callStatus}</div>
            </div>
          </>
        )}
        {currentSideScreen.callType === CallType.Video && (
          <>
            <video
              className={`w-auto rounded-lg mt-5 ${
                onCall
                  ? "absolute right-[20px] sm:bottom-[20px] sm:top-auto top-0 h-[18%]"
                  : "h-[30%] mb-10"
              }`}
              ref={localMediaRef}
              autoPlay
              muted
              playsInline
            />
            <video
              className={`h-full w-max rounded-lg md:m-3 ${
                !onCall && "hidden"
              }`}
              ref={remoteMediaRef}
              autoPlay
              playsInline
            />
          </>
        )}
        {currentSideScreen.callType === CallType.Audio && (
          <>
            <audio
              className="hidden"
              ref={localMediaRef}
              muted
              autoPlay
            ></audio>
            <audio className="hidden" ref={remoteMediaRef} autoPlay></audio>
          </>
        )}
      </div>
      <div className="flex justify-center gap-6 absolute bottom-6 w-full">
        {currentSideScreen.callType === CallType.Video && (
          <button
            className="hover:bg-zinc-700 hover:bg-opacity-50 p-3 rounded-full h-fit"
            onClick={() => {
              if (!videoTrack) return;
              if (isVideo) {
                videoTrack.enabled = false;
                setIsVideo(false);
              } else {
                videoTrack.enabled = true;
                setIsVideo(true);
              }
            }}
          >
            {!isVideo ? (
              <VideoCameraSlashIcon className="h-8" />
            ) : (
              <VideoCameraIcon className="h-8" />
            )}
          </button>
        )}
        <button
          className="bg-danger hover:bg-[#d12624] p-3 rounded-full h-fit"
          onClick={() => {
            if (onCall) {
              updateDoc(doc(DB, "rooms", roomId), {
                onCall: false,
              }).then(() => {
                setOnCall(false);
                endCall();
              });
            } else {
              endCall();
            }
          }}
        >
          <PhoneIcon className="h-8 rotate-[135deg]" />
        </button>
        <button
          className="hover:bg-zinc-700 hover:bg-opacity-50 p-3 rounded-full h-fit"
          onClick={() => {
            if (!audioTrack) return;
            if (isAudio) {
              audioTrack.enabled = false;
              setIsAudio(false);
            } else {
              audioTrack.enabled = true;
              setIsAudio(true);
            }
          }}
        >
          {!isAudio ? (
            <MicrophoneSlashIcon className="h-8" />
          ) : (
            <MicrophoneIcon className="h-8" />
          )}
        </button>
      </div>
    </div>
  );
}
