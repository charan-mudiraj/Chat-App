import ProfileBar from "../Components/ProfileBar";
import Input from "../Components/Input";
import AddGroup from "../Components/AddGroup";
import { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import { UserGroupIcon, UserCircleIcon } from "@heroicons/react/20/solid";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { DB } from "../firestore/firestore";
import {
  Group,
  MessageStatus,
  User,
  UserConnection,
} from "../Components/types";
import Loader from "../Components/Loader";
import { cropPhoto } from "../Components/Functions";

export default function ChatsList({ classes }: any) {
  const [isAddGroupClicked, addGroupToggle] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [croppedImage, setCroppedImage] = useState("");

  useEffect(() => {
    setIsLoading(true);
    const currUser = window.localStorage.getItem("chatapp-user-id");
    const q1 = query(collection(DB, "groups"), orderBy("lastUpdated", "desc"));
    const unsubGroups = onSnapshot(q1, (snapshot) => {
      const chats: Group[] = [];
      snapshot.docs.forEach((doc) => {
        if (
          currUser != null &&
          doc.data().members.findIndex((m) => m.userId == currUser) >= 0
        ) {
          chats.push(doc.data() as Group);
          chats.reduce;
        }
      });
      setGroups(chats);
    });
    const q2 = query(collection(DB, "users"));
    let connections: UserConnection[];
    if (currUser != null) {
      getDoc(doc(DB, "users", currUser)).then((snap) => {
        connections = snap.data()?.connections;
      });
    }
    const unsubChats = onSnapshot(q2, (snapshot) => {
      let chats: User[] = [];
      snapshot.docs.forEach((doc) => {
        if (currUser != null && doc.data().id != currUser) {
          chats.push(doc.data() as User);
        } else if (doc.data().id == currUser) {
          setCurrentUser(doc.data() as User);
        }
      });
      // Sort users based on the lastUpdated field within their connections
      chats.sort((a, b) => {
        const lastUpdatedA = connections.find(
          (connection) => connection.userId === a.id
        )?.lastUpdated;
        const lastUpdatedB = connections.find(
          (connection) => connection.userId === b.id
        )?.lastUpdated;
        // Sort in descending order (latest first)
        return Number(lastUpdatedB) - Number(lastUpdatedA);
      });
      setUsers(chats);
    });
    setIsLoading(false);
    return () => {
      unsubGroups();
      unsubChats();
    };
  }, []);
  useEffect(() => {
    if (currentUser) {
      cropPhoto(currentUser.profileImgUrl).then((croppedImageUrl) => {
        setCroppedImage(croppedImageUrl as string);
      });
    }
  }, [currentUser]);
  const filteredGroups = () => {
    if (searchString) {
      return groups.filter((g) =>
        g.name.toLowerCase().includes(searchString.toLowerCase())
      );
    }
    return groups;
  };
  const filteredUsers = () => {
    if (searchString) {
      return users.filter((u) =>
        u.name.toLowerCase().includes(searchString.toLowerCase())
      );
    }
    return users;
  };
  return (
    <div className={"flex flex-col h-screen relative" + " " + classes}>
      {isAddGroupClicked && (
        <AddGroup
          onClose={() => {
            addGroupToggle((val) => !val);
          }}
        />
      )}
      {isLoading && <Loader classes="absolute" />}
      <div className="flex gap-3 p-3 sticky top-0 bg-secondary">
        {currentUser && currentUser.profileImgUrl && croppedImage ? (
          <img src={croppedImage} className="h-14 rounded-full" />
        ) : (
          <div>
            <UserCircleIcon className="border-white border-2 h-14 rounded-full" />
          </div>
        )}

        <Input
          placeholder="Search user or group..."
          onInput={(e) => {
            setSearchString(e.target.value);
          }}
          type="text"
          autoComplete="off"
        />
        <button
          className="rounded-xl border-none bg-primary text-white py-1 pl-2 pr-3 flex items-center"
          onClick={() => {
            addGroupToggle((val) => !val);
          }}
        >
          <PlusIcon className="h-8 pr-1" />
          <p className="w-max">
            <UserGroupIcon className="h-11" />
          </p>
        </button>
      </div>
      <div className="flex flex-col overflow-auto h-full">
        {users.length > 0 && groups.length > 0 && (
          <div className="border-white border-b-2 mx-5 opacity-50 text-lg">
            <p className="ml-1">Groups</p>
          </div>
        )}
        {filteredGroups().map((g, i) => (
          <ProfileBar
            key={i}
            isGroup={true}
            id={g.id}
            chatId={g.id}
            imageUrl={g.groupImgUrl}
            name={g.name}
            status=""
            lastMsgStatus={
              g.members[
                g.members.findIndex(
                  (m) =>
                    m.userId ==
                    (window.localStorage.getItem("chatapp-user-id") as string)
                )
              ].lastMsgStatus
            }
            lastMsgStatusForGroup={(() => {
              for (let m of g.members) {
                if (m.lastMsgStatus != MessageStatus.SEEN)
                  return MessageStatus.SENT;
              }
              return MessageStatus.SEEN;
            })()}
            lastMsg={g.lastMessage}
            lastUpdatedTime={g.lastUpdatedTime}
            lastMsgSenderId={g.lastMsgSenderId}
            lastMsgSenderName={g.lastMsgSenderName}
          />
        ))}
        {users.length > 0 && groups.length > 0 && (
          <div className="border-white border-b-2 mx-5 opacity-50 text-lg">
            <p className="ml-1">Users</p>
          </div>
        )}
        {filteredUsers().map((u, i) => {
          const index = currentUser?.connections.findIndex(
            (c) => c.userId == u.id
          );
          if (index >= 0) {
            return (
              <ProfileBar
                key={i}
                isGroup={false}
                chatId={currentUser.connections[index].chatId}
                id={u.id}
                imageUrl={u.profileImgUrl}
                name={u.name}
                status={u.status}
                lastMsgStatus={currentUser.connections[index].lastMsgStatus}
                lastMsg={currentUser.connections[index].lastMessage}
                lastUpdatedTime={currentUser.connections[index].lastUpdatedTime}
                lastMsgSenderId={currentUser.connections[index].lastMsgSenderId}
                lastMsgSenderName={
                  currentUser.connections[index].lastMsgSenderName
                }
              />
            );
          }
          return (
            <ProfileBar
              key={i}
              isGroup={false}
              chatId={null}
              id={u.id}
              imageUrl={u.profileImgUrl}
              name={u.name}
              status={u.status}
              lastMsgStatus={MessageStatus.SEEN}
              lastMsg={""}
              lastUpdatedTime={""}
              lastMsgSenderId={""}
              lastMsgSenderName={""}
            />
          );
        })}
      </div>
    </div>
  );
}
