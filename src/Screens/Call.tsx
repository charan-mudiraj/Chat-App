import { VideoCameraIcon, MicrophoneIcon, VideoCameraSlashIcon, PhoneIcon, UserCircleIcon } from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";
import MicrophoneSlashIcon from "../Components/MicrophoneSlashIcon";
import { useRecoilState } from "recoil";
import { CallType, SideScreenSchema, User } from "../Components/types";
import { sideScreenAtom } from "../atoms/atom";
import { doc, getDoc } from "firebase/firestore";
import { DB } from "../firestore/firestore";

export default function Call({classes}: {classes: string}) {
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [isAudio, setIsAudio] = useState<boolean>(false);
  const [currentSideScreen, setCurrentSideScreen] = useRecoilState<SideScreenSchema>(sideScreenAtom);
  const [callStatus, setCallStatus] = useState<string>("Calling...");
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(()=>{
    const getOnlineStatus = async ()=>{
      const snapshot = await getDoc(doc(DB, "users", currentSideScreen.userId));
      if(snapshot.exists()){
        const recipient = snapshot.data() as User;
        if(recipient.isOnline){
          setCallStatus("Ringing...");
        }
        else{
          setCallStatus(currentSideScreen.name + " is offline");
          setTimeout(()=>{
            endCall();
          }, 2000);
        }
      }
    } 
    const getMedia = async ()=>{
      const stream = await navigator.mediaDevices.getUserMedia(
        {video: true, audio: true});
        if(localVideoRef && localVideoRef.current) localVideoRef.current.srcObject = stream;
    }
    getMedia();
    getOnlineStatus();
  }, []);

  const endCall = ()=>{
    setCallStatus("Ending Call...")
    setTimeout(()=>{
      setCurrentSideScreen((curr)=>{
        return{
          ...curr,
          onCall: false
        }
      })
    }, 1000);
  }

  return (
    <div className={"flex flex-col w-screen chat-pattern bg-repeat bg-contain relative" + " " + classes}>
        <div className="flex flex-col items-center justify-center gap-2 h-full">
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
        {currentSideScreen.callType === CallType.Video && <video className="h-20 w-40 rounded-lg" controls ref={localVideoRef} autoPlay muted playsInline />}
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
