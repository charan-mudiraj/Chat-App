import Close from "./Close";
import Input from "./Input";
import { PlusIcon } from "@heroicons/react/20/solid";
import { AddPhoto, Photo } from "./AddUser";
import { useState } from "react";
import { globalLoaderAtom } from "../atoms/atom";
import { useSetRecoilState } from "recoil";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { DB, DBStorage } from "../firestore/firestore";
import { Group } from "./types";
import { getUniqueID } from "./Functions";

export default function AddGroup({ onClose }: any) {
  const [photo, setPhoto] = useState<File>();
  const [groupname, setGroupname] = useState("");
  const setIsLoading = useSetRecoilState(globalLoaderAtom);

  const inputPhoto = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();
    input.addEventListener("change", async () => {
      const file = input.files[0];
      setPhoto(file);
    });
  };
  const addGroup = async () => {
    // ensure the presence of data
    if (!groupname) {
      alert("Group name field are mandatory");
      return;
    }
    setIsLoading(true);
    try {
      // check if groupname already exists
      const collectionRef = collection(DB, "groups");
      const q = query(collectionRef, where("name", "==", groupname));
      const docs = await getDocs(q);
      if (!docs.empty) {
        setIsLoading(false);
        alert("groupname already exists");
        return;
      }
      // upload the group image (if added) and get the download URL
      let photoUrl = "";
      if (photo) {
        const storageRef = ref(DBStorage, "Group_Images/" + photo.name);
        const snapshot = await uploadBytes(storageRef, photo);
        photoUrl = await getDownloadURL(storageRef);
      }
      // get a doc reference for new group
      const newDocRef = doc(collection(DB, "groups"));
      // create a new group
      const newGroup: Group = {
        id: newDocRef.id,
        name: groupname,
        groupImgUrl: photoUrl,
        lastUpdated: Number(getUniqueID()),
        members: [window.localStorage.getItem("chatapp-user-id")] as string[],
        lastMessage: "",
      };
      // upload the group data
      await setDoc(newDocRef, newGroup);
      onClose();
      window.location.reload();
    } catch (e) {
      alert("There was an Error");
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      className="bg-black w-screen h-screen absolute bg-opacity-70 flex items-center justify-center z-10"
      onClick={(e) => {
        if (e.target == e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-dark rounded-xl px-6 pb-6 pt-3 flex flex-col items-end">
        <Close onClick={onClose} />
        <div className="flex flex-col gap-5 items-center pt-5">
          {photo ? (
            <Photo src={URL.createObjectURL(photo)} />
          ) : (
            <AddPhoto onClick={inputPhoto} />
          )}
          <Input
            placeholder="Enter Group name..."
            onInput={(e) => {
              setGroupname(e.target.value);
            }}
          />
          <div className="flex gap-5">
            <button
              className="rounded-xl border-none bg-primary text-white py-2 pl-6 pr-8 flex items-center text-lg"
              onClick={addGroup}
            >
              <PlusIcon className="h-6 pr-1" />
              Add
            </button>
            <button
              className="rounded-xl border-none bg-secondary text-white py-4 px-9 text-lg"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
