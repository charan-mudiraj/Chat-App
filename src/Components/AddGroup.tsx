import Close from "./Close";
import Input from "./Input";
import {
  PlusIcon,
  ChevronUpDownIcon,
  UserCircleIcon,
} from "@heroicons/react/20/solid";
import { AddPhoto, Photo } from "./AddUser";
import { useEffect, useState } from "react";
import { globalLoaderAtom } from "../atoms/atom";
import { useSetRecoilState } from "recoil";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  orderBy,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { DB, DBStorage } from "../firestore/firestore";
import { Group, GroupMember, MessageStatus, User } from "./types";
import {
  cropPhoto,
  generateRandomColor,
  getCurrentTime,
  getUniqueID,
} from "./Functions";

function ProfileImage({ imageUrl }: any) {
  const [croppedImage, setCroppedImage] = useState("");
  useEffect(() => {
    cropPhoto(imageUrl).then((croppedImg) => {
      setCroppedImage(croppedImg as string);
    });
  }, []);
  return (
    <>
      {croppedImage && (
        <img src={croppedImage} className="h-10 mr-2 rounded-full" />
      )}
    </>
  );
}
export default function AddGroup({ onClose }: any) {
  const [photo, setPhoto] = useState<File>();
  const [groupname, setGroupname] = useState("");
  const setIsLoading = useSetRecoilState(globalLoaderAtom);
  const [selectedUsers, setSelectedUsers] = useState<GroupMember[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isDropDownActive, toggleDropDown] = useState(false);
  const [croppedPhoto, setCroppedPhoto] = useState("");

  const inputPhoto = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();
    input.addEventListener("change", async () => {
      const file = input.files[0];
      setPhoto(file);
      //  get cropped photo
      const bolbUrl = URL.createObjectURL(file);
      const croppedPhotoSrc = await cropPhoto(bolbUrl);
      setCroppedPhoto(croppedPhotoSrc as string);
    });
  };
  const addGroup = async () => {
    // ensure the presence of data
    if (!groupname) {
      alert("Group name field are mandatory");
      return;
    }
    if (selectedUsers.length == 0) {
      alert("Select atleast one user for group.");
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
        await uploadBytes(storageRef, photo);
        photoUrl = await getDownloadURL(storageRef);
      }
      // get a doc reference for new group
      const newDocRef = doc(collection(DB, "groups"));
      // create a new group
      const newGroup: Group = {
        id: newDocRef.id,
        name: groupname,
        groupImgUrl: photoUrl,
        lastUpdated: getUniqueID(),
        members: [
          {
            userId: window.localStorage.getItem("chatapp-user-id") as string,
            lastMsgStatus: MessageStatus.SEEN,
            color: generateRandomColor(),
          },
          ...selectedUsers,
        ],
        lastMessage: "",
        lastUpdatedTime: getCurrentTime(),
        lastMsgSenderId: "",
        lastMsgSenderName: "",
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

  const handleCheckboxChange = (userId: string) => {
    let updatedSelection = [...selectedUsers];
    const index = updatedSelection.findIndex((s) => s.userId == userId);
    if (index >= 0) {
      updatedSelection.splice(index, 1);
    } else {
      updatedSelection.push({
        userId: userId,
        lastMsgStatus: MessageStatus.SEEN,
        color: generateRandomColor(),
      });
    }
    setSelectedUsers(updatedSelection);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(DB, "users"), orderBy("name", "asc"));
      const snapshot = await getDocs(q);
      const users: User[] = [];
      snapshot.forEach((doc) => {
        if (window.localStorage.getItem("chatapp-user-id") != doc.data().id) {
          users.push(doc.data() as User);
        }
      });
      setUsersList(users);
    };
    fetchUsers();

    document.addEventListener("click", (e) => {
      const usersListDiv = document.querySelectorAll(".users-list");
      const docArea = e.target as Node;
      let isInside = false;
      usersListDiv.forEach((div) => {
        if (div.contains(docArea)) {
          isInside = true;
        }
      });
      if (!isInside) {
        toggleDropDown(false);
        document.removeEventListener("click", () => {});
      }
    });
  }, []);
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
          {photo && croppedPhoto ? (
            <Photo src={croppedPhoto} />
          ) : (
            <AddPhoto onClick={inputPhoto} />
          )}
          <Input
            placeholder="Enter Group name..."
            onInput={(e) => {
              setGroupname(e.target.value);
            }}
          />
          <div className="w-full relative h-full">
            <div
              className="users-list cursor-pointer flex items-center w-full rounded-xl outline outline-[1px] outline-zinc-400 border-0 py-3 pl-5 pr-2 bg-secondary text-white font-light placeholder:text-white/70"
              onClick={() => {
                toggleDropDown((val) => !val);
              }}
            >
              Select Member of the Group...
              <ChevronUpDownIcon className="h-8 pl-5" />
            </div>
            {isDropDownActive && (
              <div className="users-list absolute flex flex-col bg-secondary outline-zinc-400 outline outline-[1px] rounded-xl w-full cursor-pointer px-2 py-2 min-h-full max-h-[150px] overflow-y-auto">
                {usersList.map((user) => (
                  <label
                    key={user.id}
                    className="cursor-pointer hover:bg-dark px-1 py-2 rounded-xl flex"
                  >
                    <input
                      type="checkbox"
                      value={user.id}
                      checked={
                        selectedUsers.findIndex((u) => u.userId == user.id) >= 0
                      }
                      onChange={() => handleCheckboxChange(user.id)}
                      className="cursor-pointer ml-1 mr-2"
                    />
                    <div className="flex justify-left items-center rounded-xl">
                      {user.profileImgUrl ? (
                        <ProfileImage imageUrl={user.profileImgUrl} />
                      ) : (
                        <UserCircleIcon className="h-10 pr-1" />
                      )}
                      <div className="flex flex-col">
                        <p className="text-lg font-bold text-zinc-200">
                          {user.name}
                        </p>
                        <p className="text-sm text-zinc-400">{user.status}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
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
