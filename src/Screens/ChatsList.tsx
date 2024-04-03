import ProfileBar from "../Components/ProfileBar";
import Input from "../Components/Input";
import AddGroup from "../Components/AddGroup";
import { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { DB } from "../firestore/firestore";
import { Group, User, UserConnection } from "../Components/types";
import { getUniqueID } from "../Components/Functions";

export default function ChatsList({ classes }: any) {
  const [isAddGroupClicked, addGroupToggle] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>();
  useEffect(() => {
    const currUser = window.localStorage.getItem("chatapp-user-id");

    const q1 = query(collection(DB, "groups"), orderBy("lastUpdated", "desc"));
    const unsubGroups = onSnapshot(q1, (snapshot) => {
      const chats: Group[] = [];
      snapshot.docs.forEach((doc) => {
        if (currUser != null && doc.data().members.includes(currUser)) {
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
        connections = snap.data().connections;
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
    return () => {
      unsubGroups();
      unsubChats();
    };
  }, [users]);
  return (
    <div className={"flex flex-col h-screen" + " " + classes}>
      {isAddGroupClicked && (
        <AddGroup
          onClose={() => {
            addGroupToggle((val) => !val);
          }}
        />
      )}
      <div className="flex gap-3 p-5 sticky top-0">
        <Input placeholder="Search user or group..." />
        <button
          className="rounded-xl border-none bg-primary text-white py-2 pl-6 pr-8 flex items-center"
          onClick={() => {
            addGroupToggle((val) => !val);
          }}
        >
          <PlusIcon className="h-6 pr-1" />
          <p className="w-max">Add Group</p>
        </button>
      </div>
      <div className="flex flex-col overflow-auto h-full">
        {groups.map((g, i) => (
          <ProfileBar
            key={i}
            isGroup={true}
            id={g.id}
            chatId={g.id}
            imageUrl={g.groupImgUrl}
            name={g.name}
            lastMsg={g.lastMessage}
          />
        ))}
        {users.map((u, i) => {
          const index = currentUser.connections.findIndex(
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
                lastMsg={currentUser.connections[index].lastMessage}
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
              lastMsg={""}
            />
          );
        })}
      </div>
    </div>
  );
}
