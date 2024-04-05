import {
  UserGroupIcon,
  UserCircleIcon,
  ChevronLeftIcon,
} from "@heroicons/react/20/solid";
import { useSetRecoilState } from "recoil";
import { isSideScreenActiveAtom } from "../atoms/atom";

export default function TopProfileView({ isGroup, name, imageUrl }: any) {
  const setIsSideScreenActive = useSetRecoilState(isSideScreenActiveAtom);
  return (
    <div className="bg-secondary flex w-full items-center sticky top-0 h-[9%] md:h-fit">
      <ChevronLeftIcon
        className="h-full block md:hidden hover:bg-dark"
        onClick={() => {
          setIsSideScreenActive(false);
        }}
      />
      <div className="flex items-center pl-0 md:pl-5 py-3 md:py-2 h-full">
        {imageUrl ? (
          <img src={imageUrl} className="h-full md:h-12 rounded-full" />
        ) : isGroup ? (
          <UserGroupIcon className="h-full md:h-12 border-white border-2 rounded-full" />
        ) : (
          <UserCircleIcon className="h-full md:h-12 border-white border-2 rounded-full" />
        )}
        <p className="ml-3 font-bold text-xl">{name}</p>
      </div>
    </div>
  );
}
