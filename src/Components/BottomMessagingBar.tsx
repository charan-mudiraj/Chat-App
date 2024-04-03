import { PaperAirplaneIcon, PaperClipIcon } from "@heroicons/react/20/solid";
import Input from "./Input";
import { useState } from "react";

export default function BottomMessagingBar({ sendMsg }: any) {
  const [msg, setMsg] = useState("");
  return (
    <div className="sticky bottom-0 p-4 flex justify-between items-center w-full gap-2 bg-dark border-t-[0.1px] border-secondary">
      <input
        hidden
        id="attachments"
        type="file"
        value=""
        multiple
        max={5}
        onChange={() => {}}
      />
      <label
        htmlFor="attachments"
        className="p-4 rounded-full bg-dark hover:bg-secondary"
      >
        <PaperClipIcon className="w-6 h-6" />
      </label>
      <Input
        placeholder="Message"
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
      />
      <button
        className="p-4 rounded-full bg-dark hover:bg-secondary disabled:opacity-50"
        id="msg-send-btn"
        onClick={() => {
          if (msg.trim(" ")) {
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
