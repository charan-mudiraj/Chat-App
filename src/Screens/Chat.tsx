import { useEffect, useRef, useState } from "react";
import {
  GroupMember,
  Message,
  Queue,
  SideScreenSchema,
  User,
  UserConnection,
} from "../Components/types";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { getCurrentTime, getUniqueID } from "../Components/Functions";
import { DB } from "../firestore/firestore";
import MessageBox from "../Components/Message";
import TopProfileView from "../Components/TopProfileView";
import BottomMessagingBar from "../Components/BottomMessagingBar";
import { MessageStatus } from "../Components/types";
import { useRecoilState, useRecoilValue } from "recoil";
import { chatMessagesAtom, sideScreenAtom } from "../atoms/atom";

const queueMessages = new Queue();

export default function Chat({ classes }: any) {
  const [list, setList] = useRecoilState<Message[]>(chatMessagesAtom);
  const currentSideScreen = useRecoilValue<SideScreenSchema>(sideScreenAtom);
  const [currentUser, setCurrentUser] = useState<User>();
  const messagesListRef = useRef(null);
  const scrollListToBottom = () => {
    if (
      list.length != 0 &&
      messagesListRef.current.scrollHeight >
        messagesListRef.current.clientHeight
    ) {
      messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
    }
  };
  scrollListToBottom();
  // for latest snapshots. i.e., fetching new/latest messages from DB
  useEffect(() => {
    getCurrentUser();
    const messagesRef = collection(DB, currentSideScreen.listId);
    const q = query(messagesRef, orderBy("id"));
    const unsub = onSnapshot(q, (snapshot) => {
      const newMessagesList: Message[] = [];
      snapshot.docChanges().forEach((change) => {
        // if (change.type === "added") {
        newMessagesList.push(change.doc.data() as Message);
        // }
        // also do for "updated"
      });
      // Update last msg and last updated in group doc
      if (currentSideScreen.isGroup) {
        getDoc(doc(DB, "groups", currentSideScreen.listId)).then((snapshot) => {
          if (
            snapshot.data().lastMessage !=
            newMessagesList[newMessagesList.length - 1].msg
          ) {
            updateDoc(doc(DB, "groups", currentSideScreen.listId), {
              lastMessage: newMessagesList[newMessagesList.length - 1].msg,
              lastUpdated: getUniqueID(),
            });
          }
        });
      } else {
        const currUserRef = doc(
          DB,
          "users",
          window.localStorage.getItem("chatapp-user-id") as string
        );
        getDoc(currUserRef).then((snapshot) => {
          const connections: UserConnection[] = snapshot.data().connections;
          const index = connections.findIndex(
            (c) => c.userId == currentSideScreen.userId
          );
          if (
            newMessagesList.length > 0 &&
            connections[index].lastMessage !=
              newMessagesList[newMessagesList.length - 1].msg
          ) {
            connections[index].lastMessage =
              newMessagesList[newMessagesList.length - 1].msg;
            connections[index].lastUpdated = getUniqueID();
            updateDoc(currUserRef, {
              connections: connections,
            });
          }
        });
        const userRef = doc(DB, "users", currentSideScreen.userId as string);
        getDoc(userRef).then((snapshot) => {
          const connections: UserConnection[] = snapshot.data().connections;
          const index = connections.findIndex(
            (c) => c.userId == window.localStorage.getItem("chatapp-user-id")
          );
          if (
            newMessagesList.length > 0 &&
            connections[index].lastMessage !=
              newMessagesList[newMessagesList.length - 1].msg
          ) {
            connections[index].lastMessage =
              newMessagesList[newMessagesList.length - 1].msg;
            connections[index].lastUpdated = getUniqueID();
            updateDoc(userRef, {
              connections: connections,
            });
          }
        });
      }
      let currentList: Message[];
      setList((l) => {
        currentList = JSON.parse(JSON.stringify(l));
        return [...l];
      });
      newMessagesList.forEach((newMsg) => {
        let index = currentList.findIndex((m) => m.id == newMsg.id);
        if (index >= 0) {
          // already present in the current list, so just update the status to SENT
          if (newMsg.msgStatus == MessageStatus.WAITING) {
            currentList[index].msgStatus = MessageStatus.SENT;
            setList(currentList);
            const docRef = doc(
              DB,
              currentSideScreen.listId,
              newMsg.id.toString()
            );
            updateDoc(docRef, {
              msgStatus: MessageStatus.SENT,
            });
          } else if (newMsg.msgStatus == MessageStatus.SEEN) {
            currentList[index].msgStatus = MessageStatus.SEEN;
            setList(currentList);
          }
        } else {
          // new message from the opposite person, so push to current list and update the status to SEEN
          // cuz RECEIVED is when the user is outside the Chat Screen
          setList((l) => [...l, newMsg]);
          if (
            newMsg.senderId != window.localStorage.getItem("chatapp-user-id")
          ) {
            if (!currentSideScreen.isGroup) {
              const docRef = doc(
                DB,
                currentSideScreen.listId,
                newMsg.id.toString()
              );
              updateDoc(docRef, {
                msgStatus: MessageStatus.SEEN,
              });
            } else {
              const docRef = doc(DB, "groups", currentSideScreen.listId);
              getDoc(docRef).then((snapshot) => {
                const members: GroupMember[] = snapshot.data().members;
                const index = members.findIndex(
                  (m) =>
                    m.userId ==
                    (window.localStorage.getItem("chatapp-user-id") as string)
                );
                members[index].lastMsgStatus = MessageStatus.SEEN;
                updateDoc(docRef, {
                  members: members,
                });
                const index_2 = members.findIndex(
                  (m) => m.lastMsgStatus != MessageStatus.SEEN
                );
                if (index_2 == -1) {
                  updateDoc(
                    doc(DB, currentSideScreen.listId, newMsg.id.toString()),
                    {
                      msgStatus: MessageStatus.SEEN,
                    }
                  );
                }
              });
            }
          }
        }
      });
    });

    return () => {
      unsub();
    };
  }, [currentSideScreen]);

  const getCurrentUser = async () => {
    const docRef = doc(
      DB,
      "users",
      window.localStorage.getItem("chatapp-user-id") as string
    );
    const snapshot = await getDoc(docRef);
    const user = snapshot.data() as User;
    setCurrentUser(user);
  };

  const sendMsg = async (msg: string) => {
    const id = getUniqueID();
    const newMsg: Message = {
      id: Number(id),
      msg: msg,
      msgStatus: MessageStatus.WAITING,
      senderId: window.localStorage.getItem("chatapp-user-id") as string,
      senderName: currentUser.name,
      senderProfileImg: currentUser.profileImgUrl,
      time: getCurrentTime(),
    };
    queueMessages.enqueue(newMsg);
    setList((l) => [...l, newMsg]);
  };

  useEffect(() => {
    const DBupdate = async () => {
      const msg = queueMessages.dequeue();
      if (msg && msg != -1) {
        await setDoc(doc(DB, currentSideScreen.listId, msg.id.toString()), msg);
        if (currentSideScreen.isGroup) {
          getDoc(doc(DB, "groups", currentSideScreen.listId)).then(
            (snapshot) => {
              const members: GroupMember[] = snapshot.data().members;
              members.forEach((m) => {
                if (
                  m.userId !=
                  (window.localStorage.getItem("chatapp-user-id") as string)
                ) {
                  m.lastMsgStatus = MessageStatus.SENT;
                }
              });
              updateDoc(doc(DB, "groups", currentSideScreen.listId), {
                members: members,
              });
            }
          );
        }
      }
      if (!queueMessages.isEmpty()) {
        DBupdate();
      }
    };
    DBupdate();
  }, [list]);
  return (
    <div className={"flex flex-col h-screen w-screen" + " " + classes}>
      <TopProfileView
        isGroup={currentSideScreen.isGroup}
        name={currentSideScreen.name}
        imageUrl={currentSideScreen.imageUrl}
      />
      <div className="flex flex-col overflow-auto h-full" ref={messagesListRef}>
        {list.map((m, i) => (
          <MessageBox
            key={i}
            msgStatus={m.msgStatus}
            isSender={
              m.senderId == window.localStorage.getItem("chatapp-user-id")
            }
            isGroup={currentSideScreen.isGroup}
            msgText={m.msg}
            senderName={m.senderName}
            imageUrl={m.senderProfileImg}
            time={m.time}
          />
        ))}
      </div>
      <BottomMessagingBar sendMsg={sendMsg} />
    </div>
  );
}
