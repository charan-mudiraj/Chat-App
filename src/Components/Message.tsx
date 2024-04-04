import seenIcon from "../assets/seen.png";
import sentIcon from "../assets/sent.png";
import clockIcon from "../assets/clock.png";
import { UserCircleIcon } from "@heroicons/react/20/solid";
import { GroupMember, MessageStatus } from "./types";
import { doc, getDoc } from "firebase/firestore";
import { DB } from "../firestore/firestore";
import { useEffect, useState } from "react";
function ClockIcon() {
  return <img src={clockIcon} className="h-3" />;
}
function OneTickIcon() {
  return <img src={sentIcon} className="h-2.5" />;
}
function TwoTickSeenIcon() {
  return <img src={seenIcon} className="h-2.5" />;
}
function ProfileIcon({ imageUrl }: any) {
  return (
    <>
      {imageUrl ? (
        <img src={imageUrl} className="h-10 ml-1 my-1 mr-2 rounded-full " />
      ) : (
        <UserCircleIcon className="h-12 mr-1" />
      )}
    </>
  );
}
function StatusIndicator({ status }: any) {
  return (
    <>
      {(status == MessageStatus.WAITING && <ClockIcon />) ||
        (status == MessageStatus.SENT && <OneTickIcon />) ||
        (status == MessageStatus.SEEN && <TwoTickSeenIcon />)}
    </>
  );
}
const getMemberColor = (chatId: string, senderId: string) => {
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

export default function Message({
  msgStatus,
  isSender,
  isGroup,
  msgText,
  senderName,
  imageUrl,
  time,
  chatId,
  senderId,
}: any) {
  const bgColor = isSender ? "bg-chat" : "bg-secondary";
  const justify = isSender ? "justify-end" : "justify-start";
  const roundedTop = isSender ? "rounded-tl-xl" : "rounded-tr-xl";
  const [color, setColor] = useState("white");
  useEffect(() => {
    if (isGroup && !isSender) {
      getMemberColor(chatId, senderId)
        .then((clr) => {
          setColor(clr as string);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, []);

  return (
    <div className={"p-2 flex" + " " + justify}>
      {isGroup && !isSender && <ProfileIcon imageUrl={imageUrl} />}
      <div
        className={
          "w-fit p-1.5 rounded-b-xl" + " " + bgColor + " " + roundedTop
        }
      >
        {isGroup && !isSender && (
          <p className="text-xs" style={{ color: color }}>
            {senderName}
          </p>
        )}
        <p className="text-md">{msgText}</p>
        <div className="flex justify-end items-center text-xs">
          <p className="text-xs text-zinc-300 font-thin pr-1">{time}</p>
          {isSender && <StatusIndicator status={msgStatus} />}
        </div>
      </div>
    </div>
  );
}
