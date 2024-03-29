import { UserGroupIcon, UserCircleIcon } from "@heroicons/react/20/solid";
import { useSetRecoilState } from "recoil";
import { chatMessagesAtom, sideScreenAtom } from "../atoms/atom";

export default function ProfileBar({
  isGroup,
  name,
  lastMsg,
  imageUrl,
  id,
}: any) {
  const setCurrentSideScreen = useSetRecoilState(sideScreenAtom);
  const setChatMessagesList = useSetRecoilState(chatMessagesAtom);
  const openChat = () => {
    setChatMessagesList([]);
    setCurrentSideScreen({
      listId: id,
      isGroup: isGroup,
      name: name,
      imageUrl: imageUrl,
    });
  };
  return (
    <div
      className="flex gap-3 justify-left items-center hover:bg-secondary py-1.5 hover:cursor-pointer pl-5 m-3 rounded-xl"
      onClick={openChat}
    >
      {imageUrl ? (
        <img src={imageUrl} className="h-10 pr-1" />
      ) : isGroup ? (
        <UserGroupIcon className="h-10 pr-1" />
      ) : (
        <UserCircleIcon className="h-10 pr-1" />
      )}
      <div className="flex flex-col">
        <p className="text-lg font-bold text-zinc-200">{name}</p>
        <p className="text-sm text-zinc-400">{lastMsg}</p>
      </div>
    </div>
  );
}
