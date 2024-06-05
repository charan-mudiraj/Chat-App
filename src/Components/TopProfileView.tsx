import {
  UserGroupIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  PhoneIcon,
  VideoCameraIcon
} from "@heroicons/react/20/solid";
import { useRecoilState, useSetRecoilState } from "recoil";
import { defaultSideScreenValue, isSideScreenActiveAtom, sideScreenAtom } from "../atoms/atom";
import { CallType, SideScreenSchema, User } from "./types";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { DB } from "../firestore/firestore";

export default function TopProfileView() {
  const setIsSideScreenActive = useSetRecoilState(isSideScreenActiveAtom);
  const [currentSideScreen, setCurrentSideScreen] =
    useRecoilState<SideScreenSchema>(sideScreenAtom);
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(()=>{
    let unsubRecipient;
    (async ()=>{
      unsubRecipient = onSnapshot(doc(DB, "users", currentSideScreen.userId), (doc)=>{
        if(doc.exists()){
          const recipient = doc.data() as User;
          setIsOnline(recipient.isOnline);
        }
      })
    })();
    return ()=>{
      if(unsubRecipient) unsubRecipient();
    }
  }, []);
  
  return (
    <div className="bg-secondary flex w-full items-center">
    <div className="flex w-full sticky top-0 h-fit pl-1 py-2 items-center">
      <ChevronLeftIcon
        className="h-14 block md:hidden hover:bg-dark rounded-full pr-11 z-50 hover:bg-opacity-50"
        onClick={() => {
          setIsSideScreenActive(false);
          setCurrentSideScreen(defaultSideScreenValue);
        }}
      />
      <div className="flex items-center pl-0 md:pl-5 h-full absolute left-12 md:relative md:left-0">
        {currentSideScreen.imageUrl ? (
          <img src={currentSideScreen.imageUrl} className="h-12 rounded-full" />
        ) : currentSideScreen.isGroup ? (
          <UserGroupIcon className="h-12 border-white border-2 rounded-full p-1" />
        ) : (
          <UserCircleIcon className="h-12 border-white border-2 rounded-full" />
        )}
        <div className="ml-4">
          <p className="text-xl font-semibold">{currentSideScreen.name}</p>
          <div className="flex gap-1 text-zinc-400">
            <p>{currentSideScreen.status}</p>
            {!currentSideScreen.isGroup && isOnline && <div className="flex items-center gap-1">(<div className="h-3 w-3 bg-green-500 rounded-full opacity-90"></div><p className="text-green-500 text-sm opacity-90">Online</p>)</div>}
          </div>
        </div>
      </div>
    </div>
    {!currentSideScreen.isGroup &&
    <div className="flex gap-6 z-5 pr-8 w-fit">
      <PhoneIcon className="cursor-pointer hover:bg-dark p-2 h-11 rounded-full" onClick={()=>{
        setCurrentSideScreen((curr)=>{
          return {...curr, onCall: true, callType: CallType.Audio, isCaller: true}
        });
      }} />
      <VideoCameraIcon className="cursor-pointer h-11 p-2 rounded-full hover:bg-dark" onClick={()=>{
        setCurrentSideScreen((curr)=>{
          return {...curr, onCall: true, callType: CallType.Video, isCaller: true}
        });
      }} />
    </div>}
    </div>
  );
}
