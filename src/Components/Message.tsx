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
function StatusIndicator({ status }: any) {
  return (
    <>
      {(status == MessageStatus.WAITING && <ClockIcon />) ||
        (status == MessageStatus.SENT && <OneTickIcon />) ||
        (status == MessageStatus.SEEN && <TwoTickSeenIcon />)}
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
  time,
}: any) {
  const bgColor = isSender ? "bg-chat" : "bg-secondary";
  const justify = isSender ? "justify-end" : "justify-start";
  const roundedTop = isSender ? "rounded-tl-xl" : "rounded-tr-xl";
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
        <p className="text-md">{msgText}</p>
        <div className="flex justify-end items-center text-xs">
          <p className="text-xs text-zinc-300 font-thin pr-1">{time}</p>
          {isSender && <StatusIndicator status={msgStatus} />}
        </div>
      </div>
    </div>
  );
}
