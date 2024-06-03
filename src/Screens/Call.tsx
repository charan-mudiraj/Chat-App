import { VideoCameraIcon, MicrophoneIcon, VideoCameraSlashIcon, PhoneIcon, UserCircleIcon } from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";
import MicrophoneSlashIcon from "../Components/MicrophoneSlashIcon";
import { useRecoilState } from "recoil";
import { CallType, IncommingCall, SideScreenSchema, User } from "../Components/types";
import { sideScreenAtom } from "../atoms/atom";
import { collection, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { DB } from "../firestore/firestore";

export default function Call({classes}: {classes: string}) {
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [isAudio, setIsAudio] = useState<boolean>(false);
  const [currentSideScreen, setCurrentSideScreen] = useRecoilState<SideScreenSchema>(sideScreenAtom);
  const [callStatus, setCallStatus] = useState<string>("Calling...");
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const callRingTimeLimit = 30000;

  const endCall = ()=>{
    setCallStatus("Ending Call...")
    // stop accessing the media devices
    if(localVideoRef.current && localVideoRef.current.srcObject){
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    // update the incomming call ("isIncomming") at recipient to "false"
    (async ()=>{
      try{
        await updateDoc(doc(DB, "users", currentSideScreen.userId), {
          incommingCall: {
            isIncomming: false
          }
        });
      }catch(err){
        console.error("Error updating call details", err);
      }
    })();
    setTimeout(()=>{
      setCurrentSideScreen((curr)=>{
        return{
          ...curr,
          onCall: false
        }
      })
    }, 1000);
  }

  useEffect(()=>{
    let callTimeout: NodeJS.Timeout, endTimeout: NodeJS.Timeout;
    let unsubRecipient;
    const setIncommingCall = async ()=>{
      const roomRef = doc(collection(DB, "rooms"));
      const call:IncommingCall = {
        isIncomming: true,
        callType: currentSideScreen.callType,
        callerId: window.localStorage.getItem("chatapp-user-id") as string,
        roomId: roomRef.id
      } 
      try{
        await updateDoc(doc(DB, "users", currentSideScreen.userId), {
          incommingCall: call
        });
      }catch(err){
        console.error("Error making call", err);
      }
    }
    // get media
    (async ()=>{
      const stream = await navigator.mediaDevices.getUserMedia(
        {video: currentSideScreen.callType === CallType.Video, audio: true});
        if(localVideoRef && localVideoRef.current) localVideoRef.current.srcObject = stream;
    })();
    // get online-status
    (async ()=>{
      const snapshot = await getDoc(doc(DB, "users", currentSideScreen.userId));
      if(snapshot.exists()){
        const recipient = snapshot.data() as User;
        if(recipient.isOnline){
          // make a call
          setIncommingCall();
          setCallStatus("Ringing...");
          // listen to "isIncomming" in recipient's profile (to call endCall() if it is made false by recipient)
          unsubRecipient = onSnapshot(doc(DB, "users", currentSideScreen.userId), (doc)=>{
            if(doc.exists()){
              const recipient = doc.data() as User;
              if(!recipient.incommingCall.isIncomming){
                setCallStatus(`${currentSideScreen.name} rejected the Call`);
                endTimeout = setTimeout(()=>{
                  endCall();
                }, 2000);
              }
            }
          })
          // end call if not picked up for "callRingTimeLimit" seconds
          callTimeout = setTimeout(()=>{
            setCallStatus(currentSideScreen.name + " didn't pickup the call");
            endTimeout = setTimeout(()=>{
              endCall();
            }, 2000);
          }, callRingTimeLimit)
        }
        else{
          setCallStatus(currentSideScreen.name + " is offline");
          endTimeout = setTimeout(()=>{
            endCall();
          }, 2000);
        }
      }
    })();
    
    return ()=>{
      if(callTimeout) clearTimeout(callTimeout);
      if(endTimeout) clearTimeout(endTimeout);
      if(unsubRecipient) unsubRecipient();
    }
  }, []);


  return (
    <div className={"flex flex-col w-screen chat-pattern bg-repeat bg-contain relative" + " " + classes}>
        <div className="flex flex-col items-center justify-center gap-2 h-full pb-[30px]">
      {currentSideScreen.imageUrl ? (
          <img src={currentSideScreen.imageUrl} className="h-40 rounded-full" />
        ) : (
          <UserCircleIcon className="h-40 border-white border-2 rounded-full" />
        )}
        <div className="flex flex-col gap-3 items-center">
          <p className="text-2xl font-semibold text-center">{currentSideScreen.name}</p>
          <div>
            {callStatus}
          </div>
        </div>
        {currentSideScreen.callType === CallType.Video && <video className="h-[30%] w-max rounded-lg mt-5" ref={localVideoRef} autoPlay muted playsInline />}
      </div>
        <div className="flex justify-center gap-6 absolute bottom-6 w-full">
          <button className="hover:bg-zinc-700 hover:bg-opacity-50 p-3 rounded-full h-fit" onClick={()=>{
            setIsVideo(curr=>!curr);
          }}>{!isVideo ? <VideoCameraSlashIcon className="h-8" /> : <VideoCameraIcon className="h-8" />}</button>
          <button className="bg-danger hover:bg-[#d12624] p-3 rounded-full h-fit" onClick={endCall}><PhoneIcon className="h-8 rotate-[135deg]"/></button>
          <button className="hover:bg-zinc-700 hover:bg-opacity-50 p-3 rounded-full h-fit" onClick={()=>{
            setIsAudio(curr=>!curr);
          }}>{!isAudio ? <MicrophoneSlashIcon className="h-8" />:<MicrophoneIcon className="h-8" />}</button>
        </div>
    </div>
  )
}
