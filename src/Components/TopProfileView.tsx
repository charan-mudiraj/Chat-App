import {
  UserGroupIcon,
  UserCircleIcon,
  ChevronLeftIcon,
} from "@heroicons/react/20/solid";
import { useSetRecoilState } from "recoil";
import { isSideScreenActiveAtom, sideScreenAtom } from "../atoms/atom";
import { SideScreenSchema } from "./types";
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
    <div className="bg-secondary flex w-full items-center sticky top-0 h-fit pl-1 py-2">
      <ChevronLeftIcon
        className="h-14 block md:hidden hover:bg-dark rounded-full pr-11 z-50 hover:bg-opacity-50"
        onClick={() => {
          setIsSideScreenActive(false);
          setCurrentSideScreen({
            listId: "",
            isGroup: false,
            imageUrl: "",
            name: "",
            userId: "",
            status: "",
          });
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
  );
}
