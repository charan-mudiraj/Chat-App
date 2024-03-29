import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const app = initializeApp({
  apiKey: "AIzaSyCGcrfcw_miCn2_bMzY-oa5dwo08ZgsG-Y",
  authDomain: "chat-app-cb57d.firebaseapp.com",
  projectId: "chat-app-cb57d",
  storageBucket: "chat-app-cb57d.appspot.com",
  messagingSenderId: "1076001606240",
  appId: "1:1076001606240:web:d3b58579d5f719b0a19105",
  measurementId: "G-XWR3ZD9RVZ",
});
export const DB = getFirestore(app);
export const DBStorage = getStorage();
