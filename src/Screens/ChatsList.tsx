import ProfileBar from "../Components/ProfileBar";
import Input from "../Components/Input";
import AddGroup from "../Components/AddGroup";
import { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { DB } from "../firestore/firestore";
import { Group } from "../Components/types";

export default function ChatsList({ classes }: any) {
  const [isAddGroupClicked, addGroupToggle] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  useEffect(() => {
    const fetchGroupsList = async () => {
      try {
        const q = query(
          collection(DB, "groups"),
          orderBy("lastUpdated", "desc")
        );
        const snapshot = await getDocs(q);
        const groupsList: any[] = [];
        snapshot.forEach((doc) => {
          groupsList.push(doc.data());
        });
        setGroups(groupsList);
      } catch (e) {
        alert("There was an Error");
        console.log(e);
      }
    };
    fetchGroupsList();
  }, []);
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
            isGroup={true}
            imageUrl={g.groupImgUrl}
            name={g.name}
            key={i}
            lastMsg={g.lastMessage}
            id={g.id}
          />
        ))}
      </div>
    </div>
  );
}
