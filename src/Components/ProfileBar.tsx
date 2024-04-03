import { UserGroupIcon, UserCircleIcon } from "@heroicons/react/20/solid";
import { useSetRecoilState } from "recoil";
import { chatMessagesAtom, sideScreenAtom } from "../atoms/atom";
import { UserConnection } from "./types";
import { getUniqueID } from "./Functions";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { DB } from "../firestore/firestore";

export default function ProfileBar({
  isGroup,
  name,
  lastMsg,
  imageUrl,
  id,
  chatId,
}: any) {
  const setCurrentSideScreen = useSetRecoilState(sideScreenAtom);
  const setChatMessagesList = useSetRecoilState(chatMessagesAtom);
  const openChat = () => {
    if (isGroup == false && chatId == null) {
      const currUserRef = doc(
        DB,
        "users",
        window.localStorage.getItem("chatapp-user-id") as string
      );
      const userRef = doc(DB, "users", id);
      chatId = getUniqueID();
      getDoc(currUserRef).then((snapshot) => {
        const existingConnections: UserConnection[] =
          snapshot.data().connections;
        existingConnections.push({
          userId: id,
          chatId: chatId,
          lastMessage: "",
          lastUpdated: getUniqueID(),
        });
        updateDoc(currUserRef, {
          connections: existingConnections,
        });
      });
      getDoc(userRef).then((snapshot) => {
        const existingConnections: UserConnection[] =
          snapshot.data().connections;
        existingConnections.push({
          userId: window.localStorage.getItem("chatapp-user-id") as string,
          chatId: chatId,
          lastMessage: "",
          lastUpdated: getUniqueID(),
        });
        updateDoc(userRef, {
          connections: existingConnections,
        });
      });
    }
    setChatMessagesList([]);
    setCurrentSideScreen({
      listId: chatId,
      isGroup: isGroup,
      name: name,
      imageUrl: imageUrl,
      userId: isGroup ? "" : id,
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
