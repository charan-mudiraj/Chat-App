import { useState } from "react";
import Input from "./Input";
import { UserPlusIcon, PlusIcon } from "@heroicons/react/20/solid";
import { DB, DBStorage } from "../firestore/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useSetRecoilState } from "recoil";
import { globalLoaderAtom } from "../atoms/atom";
import { User } from "./types";
import { cropPhoto } from "./Functions";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

export function AddPhoto(props: any) {
  return (
    <div
      {...props}
      className="text-zinc-400 pl-4 py-2 pr-2 rounded-2xl border-zinc-400 border-dashed border-4 hover:cursor-pointer opacity-50 hover:opacity-100"
    >
      <UserPlusIcon className="h-24" />
    </div>
  );
}
export function Photo(props: any) {
  return <img {...props} className="rounded-full h-32" />;
}
export default function AddUser() {
  const [photo, setPhoto] = useState<File>();
  const setIsLoading = useSetRecoilState(globalLoaderAtom);
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
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
  const addUser = async () => {
    // ensure the presence of data
    if (!username || !status) {
      alert("username and status fields are mandatory");
      return;
    }
    setIsLoading(true);
    try {
      // check if username already exists
      const collectionRef = collection(DB, "users");
      const q = query(collectionRef, where("name", "==", username));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setIsLoading(false);
        alert("username already exists");
        return;
      }
      // upload the profile image (if added) and get download URL
      let photoUrl = "";
      if (photo) {
        const storageRef = ref(DBStorage, "Profile_Images/" + photo.name);
        await uploadBytes(storageRef, photo);
        photoUrl = await getDownloadURL(storageRef);
      }
      // get a doc reference for new user
      const newDocRef = doc(collection(DB, "users"));
      // create a new user
      const newUser: User = {
        id: newDocRef.id,
        name: username,
        status: status,
        profileImgUrl: photoUrl,
        connections: [],
      };
      // upload the user data
      await setDoc(newDocRef, newUser);

      // save the user-id into local storage
      window.localStorage.setItem("chatapp-user-id", newDocRef.id);
      window.location.reload();
    } catch (e) {
      alert("There was an Error");
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="bg-black w-screen h-screen absolute bg-opacity-80 flex items-center justify-center z-10">
        <div className="bg-dark rounded-xl px-6 pb-6 pt-3 mx-10">
          <div className="flex flex-wrap items-start gap-5 pt-5 justify-center">
            {croppedPhoto ? (
              <Photo src={croppedPhoto} />
            ) : (
              <AddPhoto onClick={inputPhoto} />
            )}

            <div className="flex flex-col gap-3 items-center">
              <Input
                placeholder="Enter your name..."
                onInput={(e) => {
                  setUsername(e.target.value);
                }}
              />
              <Input
                placeholder="Status..."
                onInput={(e) => {
                  setStatus(e.target.value);
                }}
              />
              <div className="flex gap-5 mt-3">
                <button
                  className="rounded-xl border-none bg-primary text-white py-2 pl-3 pr-5 flex items-center text-lg"
                  onClick={addUser}
                >
                  <PlusIcon className="h-8 pr-1" />
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
