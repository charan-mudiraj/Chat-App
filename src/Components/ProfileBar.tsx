import { UserGroupIcon, UserCircleIcon } from "@heroicons/react/20/solid";
import { useRecoilState, useSetRecoilState } from "recoil";
import { chatMessagesAtom, sideScreenAtom } from "../atoms/atom";
import { GroupMember, MessageStatus, UserConnection } from "./types";
import { getUniqueID } from "./Functions";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { DB } from "../firestore/firestore";
import { useEffect, useState } from "react";

export default function ProfileBar({
  isGroup,
  name,
  lastMsg,
  imageUrl,
  id,
  chatId,
  lastMsgStatus,
  lastUpdatedTime,
}: any) {
  const [currentSideScreen, setCurrentSideScreen] =
    useRecoilState(sideScreenAtom);
  const setChatMessagesList = useSetRecoilState(chatMessagesAtom);
  const openChat = () => {
    if (currentSideScreen.listId == chatId) {
      return;
    }
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
          lastMsgStatus: MessageStatus.SEEN,
          lastUpdatedTime: "",
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
          lastMsgStatus: MessageStatus.SEEN,
          lastUpdatedTime: "",
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
      className="flex gap-3 justify-left items-center hover:bg-secondary hover:cursor-pointer m-3 rounded-xl relative"
      onClick={openChat}
    >
      {imageUrl ? (
        <img src={imageUrl} className="h-12 mr-1 rounded-full my-2 ml-3" />
      ) : isGroup ? (
        <UserGroupIcon className="h-12 mr-1 my-2 p-1 border-white border-2 rounded-full ml-3" />
      ) : (
        <UserCircleIcon className="h-14 mr-1 my-1 ml-2" />
      )}
      <div className="flex flex-col">
        <p className="text-lg font-bold text-zinc-200">{name}</p>
        <p className="text-sm text-zinc-400">{lastMsg}</p>
      </div>
      {lastMsgStatus == MessageStatus.SENT && (
        <div className="h-3 w-3 bg-primary rounded-full absolute right-4 bottom-3"></div>
      )}
      <div className="absolute right-4 top-2 text-xs">{lastUpdatedTime}</div>
    </div>
  );
}
