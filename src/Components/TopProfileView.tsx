import { UserGroupIcon, UserCircleIcon } from "@heroicons/react/20/solid";

export default function TopProfileView({ isGroup, name, imageUrl }: any) {
  return (
    <div className="bg-secondary py-1.5 flex w-full items-center sticky top-0">
      {imageUrl ? (
        <img src={imageUrl} className="h-14 rounded-full ml-3" />
      ) : isGroup ? (
        <UserGroupIcon className="ml-5 h-11 p-1 border-white border-2 rounded-full" />
      ) : (
        <UserCircleIcon className="h-12 ml-5" />
      )}
      <p className="pl-3 font-bold text-xl">{name}</p>
    </div>
  );
}
