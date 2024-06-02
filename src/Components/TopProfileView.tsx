import {
  UserGroupIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  PhoneIcon,
  VideoCameraIcon
} from "@heroicons/react/20/solid";
import { useSetRecoilState } from "recoil";
import { defaultSideScreenValue, isSideScreenActiveAtom, sideScreenAtom } from "../atoms/atom";
import { CallType, SideScreenSchema } from "./types";
import { useEffect, useState } from "react";
import { cropPhoto } from "./Functions";

export default function TopProfileView({
  isGroup,
  name,
  imageUrl,
  status,
}: any) {
  const setIsSideScreenActive = useSetRecoilState(isSideScreenActiveAtom);
  const setCurrentSideScreen =
    useSetRecoilState<SideScreenSchema>(sideScreenAtom);
  const [croppedImageUrl, setCroppedImageUrl] = useState("");
  useEffect(() => {
    if (imageUrl) {
      cropPhoto(imageUrl).then((croppedImgUrl) => {
        setCroppedImageUrl(croppedImgUrl as string);
      });
    }
  });
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
        {imageUrl && croppedImageUrl ? (
          <img src={croppedImageUrl} className="h-12 rounded-full" />
        ) : isGroup ? (
          <UserGroupIcon className="h-12 border-white border-2 rounded-full p-1" />
        ) : (
          <UserCircleIcon className="h-12 border-white border-2 rounded-full" />
        )}
        <div className="ml-4">
          <p className="font-bold text-xl">{name}</p>
          <p className="opacity-50">{status}</p>
        </div>
      </div>
    </div>
    <div className="flex gap-6 z-5 pr-8 w-fit">
      <PhoneIcon className="cursor-pointer hover:bg-dark p-2 h-11 rounded-full" onClick={()=>{
        setCurrentSideScreen((curr)=>{
          return {...curr, onCall: true, callType: CallType.Audio}
        });
      }} />
      <VideoCameraIcon className="cursor-pointer h-11 p-2 rounded-full hover:bg-dark" onClick={()=>{
        setCurrentSideScreen((curr)=>{
          return {...curr, onCall: true, callType: CallType.Video}
        });
      }} />
    </div>
    </div>
  );
}
