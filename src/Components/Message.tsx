import seenIcon from "../assets/seen.png";
import sentIcon from "../assets/sent.png";
import clockIcon from "../assets/clock.png";
import { UserCircleIcon, ArrowDownTrayIcon } from "@heroicons/react/20/solid";
import { FileType, GroupMember, MessageStatus } from "./types";
import { doc, getDoc } from "firebase/firestore";
import { DB } from "../firestore/firestore";
import { useEffect, useState } from "react";
import fileIcon from "../assets/file.png";
import { cropPhoto, downlaodFile } from "./Functions";

function ClockIcon() {
  return <img src={clockIcon} className="h-3" />;
}
function TickUnseenIcon() {
  return <img src={sentIcon} className="h-2.5" />;
}
function TickSeenIcon() {
  return <img src={seenIcon} className="h-2.5" />;
}
function ProfileIcon({ imageUrl, croppedImage }: any) {
  return (
    <>
      {imageUrl && croppedImage ? (
        <img src={croppedImage} className="h-10 ml-1 my-1 mr-2 rounded-full " />
      ) : (
        <UserCircleIcon className="h-12 mr-1" />
      )}
    </>
  );
}
export function StatusIndicator({ status }: any) {
  return (
    <>
      {(status == MessageStatus.WAITING && <ClockIcon />) ||
        (status == MessageStatus.SENT && <TickUnseenIcon />) ||
        (status == MessageStatus.SEEN && <TickSeenIcon />)}
    </>
  );
}
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
function UnknownFIleView({ name, ext, size, url }: any) {
  if (Math.floor(Number(size)) > 0) {
    size = Math.round(Number(size) * 10) / 10 + " MB";
  } else {
    size = Math.round(Number(size) * 1024 * 10) / 10 + " KB";
  }
  return (
    <div
      className="bg-black p-3 rounded-lg mr-2 flex gap-3 bg-opacity-20 cursor-pointer mb-1"
      onClick={() => {
        downlaodFile(url, name);
      }}
    >
      <img
        src={fileIcon}
        className="h-20 bg-zinc-500 py-2 rounded-lg opacity-90"
      />
      <div className="flex flex-col">
        <p className="opacity-90">{name}</p>
        <p className="opacity-40 text-sm">{ext.toUpperCase() + " File"}</p>
        <p className="opacity-40 text-xs">{size}</p>
      </div>
    </div>
  );
}
function ImageView({ url, name }: any) {
  return (
    <div
      onClick={() => {
        downlaodFile(url, name);
      }}
      className="cursor-pointer mb-1 relative"
    >
      <div className="absolute h-full w-full bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
        <ArrowDownTrayIcon className="h-8 p-1.5 bg-zinc-500 bg-opacity-60 hover:bg-opacity-90 rounded-full" />
      </div>
      <img src={url} className="h-36 rounded-lg" />
    </div>
  );
}
function VideoView({ url }: any) {
  return (
    <div className="mb-1">
      <video controls className="h-36 rounded-lg">
        <source src={url}></source>
      </video>
    </div>
  );
}
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
  isFile,
  fileDetails,
}: any) {
  const bgColor = isSender ? "bg-chat" : "bg-secondary";
  const justify = isSender ? "justify-end" : "justify-start";
  const roundedTop = isSender ? "rounded-tl-xl" : "rounded-tr-xl";
  const [color, setColor] = useState("white");
  const [croppedImage, setCroppedImage] = useState("");
  useEffect(() => {
    if (imageUrl) {
      cropPhoto(imageUrl).then((croppedImgUrl) => {
        setCroppedImage(croppedImgUrl as string);
      });
    }
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
      {isGroup && !isSender && (
        <ProfileIcon imageUrl={imageUrl} croppedImage={croppedImage} />
      )}
      <div
        className={
          "w-fit p-1.5 rounded-b-xl" + " " + bgColor + " " + roundedTop
        }
      >
        {isGroup && !isSender && (
          <p className="text-xs mb-1" style={{ color: color }}>
            {senderName}
          </p>
        )}
        {isFile &&
          ((fileDetails.type == FileType.IMAGE && (
            <ImageView url={fileDetails.url} name={fileDetails.name} />
          )) ||
            (fileDetails.type == FileType.VIDEO && (
              <VideoView url={fileDetails.url} />
            )) ||
            (fileDetails.type == FileType.OTHER && (
              <UnknownFIleView
                name={fileDetails.name}
                ext={fileDetails.ext}
                size={fileDetails.size}
                url={fileDetails.url}
              />
            )))}
        <p className="text-md">{msgText}</p>
        <div className="flex justify-end items-center text-xs">
          <p className="text-xs text-zinc-300 font-thin pr-1">{time}</p>
          {isSender && <StatusIndicator status={msgStatus} />}
        </div>
      </div>
    </div>
  );
}
