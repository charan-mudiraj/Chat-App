import AddUser from "./Components/AddUser";
import Chat from "./Screens/Chat";
import ChatsList from "./Screens/ChatsList";
import About from "./Screens/About";
import Loader from "./Components/Loader";
import { useRecoilValue } from "recoil";
import { globalLoaderAtom } from "./atoms/atom";
import { sideScreenAtom } from "./atoms/atom";
import { SideScreenSchema } from "./Components/types";
import { isSideScreenActiveAtom } from "./atoms/atom";
import { doc, getDoc } from "firebase/firestore";
import { DB } from "./firestore/firestore";
import { useEffect, useState } from "react";
import Call from "./Screens/Call";

function SideScreen({ Screen }: any) {
  return (
    <>
      <div className="bg-zinc-700 bg-opacity-60 w-0.5 hidden md:block"></div>
      {Screen}
    </>
  );
}
export default function App() {
  const isLoading = useRecoilValue(globalLoaderAtom);
  const currentSideScreen = useRecoilValue<SideScreenSchema>(sideScreenAtom);
  const isSideScreenActive = useRecoilValue<boolean>(isSideScreenActiveAtom);
  const [isUser, setIsUser] = useState<boolean>();

  useEffect(() => {
    const checkUserExists = async () => {
      const userId = window.localStorage.getItem("chatapp-user-id") as string;
      if (userId == null) {
        setIsUser(false);
        return;
      }
      const snapshot = await getDoc(doc(DB, "users", userId));
      if (snapshot.exists()) {
        setIsUser(true);
      } else {
        setIsUser(false);
      }
    };
    checkUserExists();
  }, []);

  return (
    <>
      {isLoading && <Loader classes="fixed bg-zinc-700/50 z-50" />}

      {isUser == false && <AddUser />}
      <div className="md:flex md:w-screen overflow-hidden h-screen">
        <ChatsList
          classes={
            "md:w-5/12 h-screen" +
            " " +
            (isSideScreenActive ? "hidden md:block" : "")
          }
        />

        <SideScreen
          Screen={
            isSideScreenActive ? (
              currentSideScreen.onCall ? <Call classes="md:flex h-screen" /> :
              <Chat classes="md:flex h-screen" />
            ) : (
              <About classes="md:flex h-screen" />
            )
          }
        />
      </div>
    </>
  );
}
