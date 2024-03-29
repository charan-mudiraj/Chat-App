import { atom } from "recoil";
import About from "../Screens/About";
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
  },
});
export const chatMessagesAtom = atom<Message[]>({
  key: "chatMessages",
  default: [],
});
