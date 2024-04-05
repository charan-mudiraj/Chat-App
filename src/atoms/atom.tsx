import { atom } from "recoil";
import { Message } from "../Components/types";
import { SideScreenSchema } from "../Components/types";

export const globalLoaderAtom = atom({
  key: "globalLoader",
  default: false,
});
export const sideScreenAtom = atom<SideScreenSchema>({
  key: "sideScreen",
  default: {
    listId: "",
    isGroup: false,
    imageUrl: "",
    name: "",
    userId: "",
    status: "",
  },
});
export const chatMessagesAtom = atom<Message[]>({
  key: "chatMessages",
  default: [],
});

// for mobile view
export const isSideScreenActiveAtom = atom<boolean>({
  key: "isSideScreenActive",
  default: false,
});
