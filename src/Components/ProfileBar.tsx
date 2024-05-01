import { UserGroupIcon, UserCircleIcon } from "@heroicons/react/20/solid";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  chatMessagesAtom,
  isSideScreenActiveAtom,
  sideScreenAtom,
} from "../atoms/atom";
import { GroupMember, MessageStatus, UserConnection } from "./types";
import { cropPhoto, getUniqueID } from "./Functions";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { DB } from "../firestore/firestore";
import { useEffect, useState } from "react";
// import notificationSound from "../assets/notification.mp3";
import { StatusIndicator } from "./Message";

export const getMemberColor = (chatId: string, senderId: string) => {
  return new Promise((resolve, reject) => {
    getDoc(doc(DB, "groups", chatId))
      .then((snapshot) => {
        const members: GroupMember[] = snapshot.data().members;
        const index = members.findIndex((m) => m.userId == senderId);
        if (index !== -1) {
          resolve(members[index].color);
        } else {
          reject(new Error("Member not found"));
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};
export default function ProfileBar({
  isGroup,
  name,
  imageUrl,
  id,
  chatId,
  status,
  lastMsgStatus,
  lastMsg,
  lastUpdatedTime,
  lastMsgSenderId,
  lastMsgSenderName,
  lastMsgStatusForGroup,
}: any) {
  const [currentSideScreen, setCurrentSideScreen] =
    useRecoilState(sideScreenAtom);
  const setChatMessagesList = useSetRecoilState(chatMessagesAtom);
  const setIsSideScreenActive = useSetRecoilState(isSideScreenActiveAtom);
  const [color, setColor] = useState("rgb(161 161 170)");
  const [croppedImage, setCroppedImage] = useState("");
  useEffect(() => {
    if (imageUrl) {
      cropPhoto(imageUrl).then((croppedImgUrl) => {
        setCroppedImage(croppedImgUrl as string);
      });
    }
  });
  useEffect(() => {
    if (
      isGroup &&
      lastMsgSenderId !==
        window.localStorage.getItem("chatapp-user-id").toString()
    ) {
      getMemberColor(chatId, lastMsgSenderId)
        .then((clr) => {
          setColor(clr as string);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [lastMsg]);
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
          lastMsgSenderId: "",
          lastMsgSenderName: "",
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
          lastMsgSenderId: "",
          lastMsgSenderName: "",
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
      status: status,
    });

    //for mobile view
    setIsSideScreenActive(true);
  };
  return (
    <div
      className="flex gap-3 justify-left items-center hover:bg-secondary hover:cursor-pointer m-3 rounded-xl relative"
      onClick={openChat}
    >
      {imageUrl && croppedImage ? (
        <img src={croppedImage} className="h-12 mr-1 my-2 ml-3 rounded-full" />
      ) : isGroup ? (
        <UserGroupIcon className="h-12 mr-1 my-2 ml-3 p-1 border-white border-2 rounded-full" />
      ) : (
        <UserCircleIcon className="h-12 mr-1 my-2 ml-2 border-white border-2 rounded-full" />
      )}
      <div className="flex flex-col">
        <p className="text-lg font-bold text-zinc-200">{name}</p>
        <div className="flex gap-1 items-center">
          {lastMsgSenderId ==
            (window.localStorage.getItem("chatapp-user-id") as string) &&
            (isGroup ? (
              <StatusIndicator status={lastMsgStatusForGroup} />
            ) : (
              <StatusIndicator status={lastMsgStatus} />
            ))}
          {isGroup &&
            lastMsg &&
            (lastMsgSenderId !=
            (window.localStorage.getItem("chatapp-user-id") as string) ? (
              <>
                <p className="text-sm font-bold" style={{ color: color }}>
                  {lastMsgSenderName}
                </p>
                <p className="text-sm text-zinc-400">:</p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-zinc-400">You</p>
                <p className="text-sm text-zinc-400">:</p>
              </>
            ))}
          <p className="text-sm text-zinc-400">{lastMsg}</p>
        </div>
      </div>
      {currentSideScreen.listId != chatId &&
        lastMsgSenderId !=
          (window.localStorage.getItem("chatapp-user-id") as string) &&
        lastMsgStatus === MessageStatus.SENT && (
          <div className="h-3 w-3 bg-primary rounded-full absolute right-4 bottom-3"></div>
        )}
      <div className="absolute right-4 top-2 text-xs">{lastUpdatedTime}</div>
    </div>
  );
}
