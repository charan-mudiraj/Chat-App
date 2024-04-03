import { ref } from "firebase/storage";
import { DBStorage } from "../firestore/firestore";

export const getUniqueID = () => {
  const date = new Date();
  // 16-digit ID
  const id =
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    date.getDate().toString().padStart(2, "0") +
    date.getHours().toString().padStart(2, "0") +
    date.getMinutes().toString().padStart(2, "0") +
    date.getSeconds().toString().padStart(2, "0") +
    date.getMilliseconds().toString().substring(0, 2);

  return id;
};

export const getCurrentTime = () => {
  const date = new Date();
  // 07:57 PM
  const period = date.getHours() < 12 ? "AM" : "PM";
  const hours = date.getHours() % 12 || 12;
  const time =
    hours + ":" + date.getMinutes().toString().padStart(2, "0") + " " + period;
  return time;
};
