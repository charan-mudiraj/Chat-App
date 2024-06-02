// import { useRecoilValue } from "recoil"
// import { sideScreenAtom } from "../atoms/atom"
import { VideoCameraIcon, MicrophoneIcon, VideoCameraSlashIcon, PhoneIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import MicrophoneSlashIcon from "../Components/MicrophoneSlashIcon";

export default function Call({classes}: {classes: string}) {
  // const currentSideScreen = useRecoilValue(sideScreenAtom);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [isAudio, setIsAudio] = useState<boolean>(false);
  return (
    <div className={"flex flex-col items-center justify-center w-screen chat-pattern bg-repeat bg-contain" + " " + classes}>
        <div>Call</div>
        <div className="flex justify-between gap-5">
          <button className="hover:bg-zinc-700 hover:bg-opacity-50 p-3 rounded-full" onClick={()=>{
            setIsVideo(curr=>!curr);
          }}>{!isVideo ? <VideoCameraSlashIcon className="h-8" /> : <VideoCameraIcon className="h-8" />}</button>
          <button className="bg-danger hover:bg-[#d12624] p-3 rounded-full"><PhoneIcon className="h-8 rotate-[135deg]"/></button>
          <button className="hover:bg-zinc-700 hover:bg-opacity-50 p-3 rounded-full" onClick={()=>{
            setIsAudio(curr=>!curr);
          }}>{!isAudio ? <MicrophoneSlashIcon className="h-8" />:<MicrophoneIcon className="h-8" />}</button>
        </div>
    </div>
  )
}
