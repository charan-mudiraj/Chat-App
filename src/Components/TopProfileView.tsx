import { UserGroupIcon, UserCircleIcon } from "@heroicons/react/20/solid";

export default function TopProfileView({ isGroup, name }: any) {
  return (
    <div className="bg-secondary py-1.5 flex w-full items-center sticky top-0">
      {isGroup ? (
        <UserGroupIcon className="ml-5 h-11 p-1 border-white border-2 rounded-full" />
      ) : (
        <UserCircleIcon className="h-12 ml-5" />
      )}
      <p className="pl-3 font-bold text-xl">{name}</p>
    </div>
  );
}
