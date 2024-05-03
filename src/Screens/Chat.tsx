import { useEffect, useRef, useState } from "react";
import {
  FileDetails,
  FileType,
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
import { DB, DBStorage } from "../firestore/firestore";
import sentSound from "../assets/sent.mp3";
// import receivedSound from "../assets/received.mp3";
import MessageBox from "../Components/Message";
import TopProfileView from "../Components/TopProfileView";
import BottomMessagingBar from "../Components/BottomMessagingBar";
import { MessageStatus } from "../Components/types";
import { useRecoilState, useRecoilValue } from "recoil";
import { chatMessagesAtom, sideScreenAtom } from "../atoms/atom";
import Loader from "../Components/Loader";
import { XMarkIcon } from "@heroicons/react/20/solid";
import fileIcon from "../assets/file.png";
import ReactDOM from "react-dom";
// import chatBG from "../assets/chatBG.jpg";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const queueMessages = new Queue();
function FilePreview({ file, emptyFileDraft }: any) {
  return (
    <>
      <XMarkIcon
        className="text-bold h-6 absolute top-0 right-0 bg-zinc-400 text-black rounded-full opacity-60 hover:opacity-90 cursor-pointer"
        onClick={() => {
          document.getElementById("file-preview").style.display = "none";
          emptyFileDraft();
        }}
      />
      {file}
    </>
  );
}
function UnknownFileGraphic({ ext, size, name }: any) {
  if (Math.floor(Number(size)) > 0) {
    size = Math.round(Number(size) * 10) / 10 + " MB";
  } else {
    size = Math.round(Number(size) * 1024 * 10) / 10 + " KB";
  }
  return (
    <>
      <div className="bg-secondary p-3 rounded-lg mr-2 flex gap-3 drop-shadow-xl">
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
    </>
  );
}
export default function Chat({ classes }: any) {
  const [list, setList] = useRecoilState<Message[]>(chatMessagesAtom);
  const currentSideScreen = useRecoilValue<SideScreenSchema>(sideScreenAtom);
  const [currentUser, setCurrentUser] = useState<User>();
  const messagesListRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const scrollListToBottom = () => {
    if (
      list.length != 0 &&
      messagesListRef.current.scrollHeight >
        messagesListRef.current.clientHeight
    ) {
      messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
    }
  };
  // for latest snapshots. i.e., fetching new/latest messages from DB
  useEffect(() => {
    setIsLoading(true);
    getCurrentUser();
    const messagesRef = collection(DB, currentSideScreen.listId);
    const q = query(messagesRef, orderBy("id"));
    const unsub = onSnapshot(q, (snapshot) => {
      const newMessagesList: Message[] = [];
      snapshot.docChanges().forEach((change) => {
        newMessagesList.push(change.doc.data() as Message);
      });
      // Update last msg and last updated in group doc
      if (currentSideScreen.isGroup && newMessagesList.length > 0) {
        getDoc(doc(DB, "groups", currentSideScreen.listId)).then((snapshot) => {
          if (
            newMessagesList.length == 1 &&
            snapshot.data().lastMessage != newMessagesList[0].msg
          ) {
            updateDoc(doc(DB, "groups", currentSideScreen.listId), {
              lastMessage: newMessagesList[0].msg,
              lastUpdated: getUniqueID(),
              lastUpdatedTime: getCurrentTime(),
              lastMsgSenderId: newMessagesList[0].senderId,
              lastMsgSenderName: newMessagesList[0].senderName,
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
          if (newMessagesList.length > 0) {
            connections[index].lastMessage =
              newMessagesList[newMessagesList.length - 1].msg;
            connections[index].lastUpdated = getUniqueID();
            connections[index].lastMsgStatus =
              newMessagesList[newMessagesList.length - 1].msgStatus;
            connections[index].lastUpdatedTime = getCurrentTime();
            connections[index].lastMsgSenderId =
              newMessagesList[newMessagesList.length - 1].senderId;
            connections[index].lastMsgSenderName =
              newMessagesList[newMessagesList.length - 1].senderName;
            updateDoc(currUserRef, {
              connections: connections,
            });
          }
        });
        const userRef = doc(DB, "users", currentSideScreen.userId as string);
        getDoc(userRef).then((snapshot) => {
          const connections: UserConnection[] = snapshot.data().connections;
          const index = connections.findIndex(
            (c) =>
              c.userId ==
              (window.localStorage.getItem("chatapp-user-id") as string)
          );
          if (newMessagesList.length > 0) {
            connections[index].lastMessage =
              newMessagesList[newMessagesList.length - 1].msg;
            connections[index].lastUpdated = getUniqueID();
            connections[index].lastMsgStatus =
              newMessagesList[newMessagesList.length - 1].msgStatus;
            connections[index].lastUpdatedTime = getCurrentTime();
            connections[index].lastMsgSenderId =
              newMessagesList[newMessagesList.length - 1].senderId;
            connections[index].lastMsgSenderName =
              newMessagesList[newMessagesList.length - 1].senderName;
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
            if (
              newMsg.senderId ==
              (window.localStorage.getItem("chatapp-user-id") as string)
            ) {
              new Audio(sentSound).play();
            }
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
          // if (
          //   !currentSideScreen.isGroup &&
          //   newMsg.senderId !=
          //     (window.localStorage.getItem("chatapp-user-id") as string)
          // ) {
          //   new Audio(receivedSound).play();
          // }
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
              const currUserRef = doc(
                DB,
                "users",
                window.localStorage.getItem("chatapp-user-id") as string
              );
              getDoc(currUserRef).then((snapshot) => {
                const connections: UserConnection[] =
                  snapshot.data().connections;
                const index = connections.findIndex(
                  (c) => c.userId == currentSideScreen.userId
                );

                connections[index].lastMsgStatus = MessageStatus.SEEN;
                updateDoc(currUserRef, {
                  connections: connections,
                });
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
    setIsLoading(false);
    // document.getElementById("chat-bottom-msg-input")?.focus();
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
    let newMsg: Message = {
      id: Number(id),
      msg: msg,
      msgStatus: MessageStatus.WAITING,
      senderId: window.localStorage.getItem("chatapp-user-id") as string,
      senderName: currentUser.name,
      senderProfileImg: currentUser.profileImgUrl,
      time: getCurrentTime(),
      isFile: file != null && fileDetails != null,
    };

    if (newMsg.isFile && fileDetails != null && file != null) {
      newMsg.fileDetails = { ...fileDetails };
      setList((l) => [...l, newMsg]);
      // upload file and set url from blob to storage
      const storageRef = ref(DBStorage, "Files/" + fileDetails.name);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);
      newMsg = {
        ...newMsg,
        fileDetails: {
          ...fileDetails,
          url: fileUrl,
        },
      };
    } else {
      setList((l) => {
        return [...l, newMsg];
      });
    }

    queueMessages.enqueue(newMsg);
    setList((l) => {
      return [...l];
    });
    setFile(null);
    setFileDetails(null);
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
                } else {
                  m.lastMsgStatus = MessageStatus.SEEN;
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
    scrollListToBottom();
    DBupdate();
  }, [list]);
  const inputFile = (e) => {
    const file: File = e.target.files[0];
    if (!file) {
      return;
    }
    const size: number = file.size / (1024 * 1024); // MegaBytes
    const sizeLimit = 30; // 30 MB
    if (size > sizeLimit) {
      alert(
        "File size is larger than expected.\nMax Upload size is: " +
          sizeLimit +
          " MB"
      );
      return;
    }

    const filePreviewDiv = document.getElementById("file-preview");
    const fileUrl = URL.createObjectURL(file);
    const fileName = file.name;
    const slashIndex = file.type.indexOf("/");
    const fileExt = file.type.substring(slashIndex + 1);
    let fileType: FileType = FileType.OTHER;

    if (file.type.startsWith("image/")) {
      fileType = FileType.IMAGE;
      const imgElement = (
        <img
          src={fileUrl}
          className="h-20 rounded-lg drop-shadow-xl mr-2"
        ></img>
      );
      const imgPreviewComponent = (
        <FilePreview
          file={imgElement}
          emptyFileDraft={() => {
            setFile(null);
            setFileDetails(null);
          }}
        />
      );
      ReactDOM.render(imgPreviewComponent, filePreviewDiv);
    } else if (file.type.startsWith("video/")) {
      fileType = FileType.VIDEO;
      const videoElement = (
        <video controls className="h-20 rounded-lg drop-shadow-xl mr-2">
          <source src={fileUrl}></source>
        </video>
      );
      const videoPreviewComponent = (
        <FilePreview
          file={videoElement}
          emptyFileDraft={() => {
            setFile(null);
            setFileDetails(null);
          }}
        />
      );
      ReactDOM.render(videoPreviewComponent, filePreviewDiv);
    } else {
      const unknownFileComponent = (
        <UnknownFileGraphic ext={fileExt} size={size} name={fileName} />
      );
      const unknownFilePreviewComponent = (
        <FilePreview
          file={unknownFileComponent}
          emptyFileDraft={() => {
            setFile(null);
            setFileDetails(null);
          }}
        />
      );
      ReactDOM.render(unknownFilePreviewComponent, filePreviewDiv);
    }
    filePreviewDiv.style.display = "block";
    setFile(file);
    setFileDetails({
      type: fileType,
      name: fileName,
      ext: fileExt,
      size: size,
      url: fileUrl,
    });
  };

  return (
    <div
      className={
        "flex flex-col h-screen w-screen chat-pattern bg-repeat bg-contain" +
        " " +
        classes
      }
    >
      <TopProfileView
        isGroup={currentSideScreen.isGroup}
        name={currentSideScreen.name}
        imageUrl={currentSideScreen.imageUrl}
        status={currentSideScreen.status}
      />
      {isLoading && <Loader classes="absolute" />}
      {list.length == 0 && (
        <div className="text-lg opacity-30 flex items-end justify-center h-full">
          <p>No messages to show</p>
        </div>
      )}
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
            chatId={currentSideScreen.listId}
            senderId={m.senderId}
            isFile={m.isFile}
            fileDetails={m.fileDetails}
          />
        ))}
      </div>
      <div
        className="bg-transparent w-fit pl-3 pb-5 pr-5 rounded-lg absolute bottom-20 pt-5"
        id="file-preview"
      ></div>
      <BottomMessagingBar
        sendMsg={sendMsg}
        inputFile={inputFile}
        emptyFileDraft={() => {
          setFile(null);
          setFileDetails(null);
        }}
      />
    </div>
  );
}
