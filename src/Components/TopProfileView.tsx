import {
  UserGroupIcon,
  UserCircleIcon,
  ChevronLeftIcon,
} from "@heroicons/react/20/solid";
import { useSetRecoilState } from "recoil";
import { isSideScreenActiveAtom, sideScreenAtom } from "../atoms/atom";
import { SideScreenSchema } from "./types";

export default function TopProfileView({ isGroup, name, imageUrl }: any) {
  const setIsSideScreenActive = useSetRecoilState(isSideScreenActiveAtom);
  const setCurrentSideScreen =
    useSetRecoilState<SideScreenSchema>(sideScreenAtom);
  return (
    <div className="bg-secondary flex w-full items-center sticky top-0 h-fit pl-1">
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
          });
        }}
      />
      <div className="flex items-center pl-0 md:pl-5 py-3 md:py-2 h-full absolute left-12 md:relative md:left-0">
        {imageUrl ? (
          <img src={imageUrl} className="h-12 rounded-full" />
        ) : isGroup ? (
          <UserGroupIcon className="h-12 border-white border-2 rounded-full" />
        ) : (
          <UserCircleIcon className="h-12 border-white border-2 rounded-full" />
        )}
        <p className="ml-4 font-bold text-xl">{name}</p>
      </div>
    </div>
  );
}
