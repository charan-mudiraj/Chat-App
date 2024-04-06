import { PaperAirplaneIcon, PaperClipIcon } from "@heroicons/react/20/solid";
import Input from "./Input";
import { useEffect, useState } from "react";
import { sideScreenAtom } from "../atoms/atom";
import { useRecoilValue } from "recoil";

export default function BottomMessagingBar({
  sendMsg,
  inputFile,
  emptyFileDraft,
}: any) {
  const [msg, setMsg] = useState("");
  const currentSideScreen = useRecoilValue(sideScreenAtom);
  useEffect(() => {
    setMsg("");
    document.getElementById("file-preview").style.display = "none";
    emptyFileDraft();
  }, [currentSideScreen]);
  return (
    <div className="sticky bottom-0 p-4 flex justify-between items-center gap-2 bg-dark border-t-[0.1px] border-secondary">
      <input
        hidden
        id="attachments"
        type="file"
        value=""
        multiple
        max={5}
        onChange={inputFile}
      />
      <label
        htmlFor="attachments"
        className="p-4 rounded-full bg-dark hover:bg-secondary"
      >
        <PaperClipIcon className="w-6 h-6" />
      </label>
      <Input
        placeholder="Message"
        type="text"
        autoComplete="off"
        value={msg}
        onInput={(e) => {
          setMsg(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key == "Enter") {
            const sendBtn = document.getElementById("msg-send-btn");
            sendBtn?.click();
          }
        }}
        id="chat-bottom-msg-input"
      />
      <button
        className="p-4 rounded-full bg-dark hover:bg-secondary disabled:opacity-50"
        id="msg-send-btn"
        onClick={() => {
          if (document.getElementById("file-preview").style.display != "none") {
            sendMsg(msg);
            setMsg("");
            document.getElementById("file-preview").style.display = "none";
          } else if (msg.trim()) {
            sendMsg(msg);
            setMsg("");
          }
        }}
      >
        <PaperAirplaneIcon className="w-6 h-6" />
      </button>
    </div>
  );
}
