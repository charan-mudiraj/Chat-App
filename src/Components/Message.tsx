import reachedIcon from "../assets/reached.png";
import seenIcon from "../assets/seen.png";
import sentIcon from "../assets/sent.png";
import clockIcon from "../assets/clock.png";
import { UserCircleIcon } from "@heroicons/react/20/solid";
import { MessageStatus } from "./types";
function ClockIcon() {
  return <img src={clockIcon} className="h-3" />;
}
function OneTickIcon() {
  return <img src={sentIcon} className="h-2.5" />;
}
function TwoTickIcon() {
  return <img src={reachedIcon} className="h-2.5" />;
}
function TwoTickSeenIcon() {
  return <img src={seenIcon} className="h-2.5" />;
}
function ProfileIcon({ imageUrl }: any) {
  return (
    <>
      {imageUrl ? (
        <img src={imageUrl} className="h-10 pr-1" />
      ) : (
        <UserCircleIcon className="h-10 pr-1" />
      )}
    </>
  );
}
export default function Message({
  msgStatus,
  isSender,
  isGroup,
  msgText,
  senderName,
  imageUrl,
}: any) {
  const bgColor = isSender ? "bg-chat" : "bg-secondary";
  const justify = isSender ? "justify-end" : "justify-start";
  const roundedTop = isSender ? "rounded-tl-xl" : "rounded-tr-xl";
  console.log(senderName);
  console.log(imageUrl);
  return (
    <div className={"p-2 flex" + " " + justify}>
      {isGroup && !isSender && <ProfileIcon imageUrl={imageUrl} />}
      <div
        className={
          "w-fit p-1.5 rounded-b-xl" + " " + bgColor + " " + roundedTop
        }
      >
        {isGroup && !isSender && (
          <p className="text-xs text-pink-400">{senderName}</p>
        )}
        <p>{msgText}</p>
        <div className="flex justify-end items-center">
          <p className="text-sm text-zinc-300 font-thin pr-1">time</p>
          {(msgStatus == MessageStatus.WAITING && <ClockIcon />) ||
            (msgStatus == MessageStatus.SENT && <OneTickIcon />) ||
            (msgStatus == MessageStatus.RECEIVED && <TwoTickIcon />) ||
            (msgStatus == MessageStatus.SEEN && <TwoTickSeenIcon />)}
        </div>
      </div>
    </div>
  );
}
