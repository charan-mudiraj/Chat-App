import { atom } from "recoil";
import { SideScreenSchema, Message } from "../Components/types";

export const globalLoaderAtom = atom({
  key: "globalLoader",
  default: false,
});

export const defaultSideScreenValue = {
  listId: "",
  isGroup: false,
  imageUrl: "",
  name: "",
  userId: "",
  status: "",
  onCall: false,
  isOnline: false
}
export const sideScreenAtom = atom<SideScreenSchema>({
  key: "sideScreen",
  default: defaultSideScreenValue,
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