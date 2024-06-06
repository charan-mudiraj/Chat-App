import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { DB } from "../firestore/firestore";
import { Room } from "./types";

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

export function generateRandomColor(transparency = 1) {
  // Generate random values for red, green, and blue channels
  const red = Math.floor(Math.random() * 256); // Random value between 0 and 255
  const green = Math.floor(Math.random() * 256); // Random value between 0 and 255
  const blue = Math.floor(Math.random() * 256); // Random value between 0 and 255

  // Ensure transparency value is within range [0, 1]
  transparency = Math.min(1, Math.max(0, transparency));

  // Construct the color string in RGBA format with the provided transparency
  const rgbaColor = `rgba(${red}, ${green}, ${blue}, ${transparency})`;

  return rgbaColor;
}

export const downlaodFile = async (url: string, fileName: string) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(new Blob([blob]));
    const linkElement = document.createElement("a");
    linkElement.href = blobUrl;
    linkElement.setAttribute("download", fileName);
    document.body.appendChild(linkElement);
    linkElement.click();
    linkElement.parentNode.removeChild(linkElement);
  } catch (e) {
    console.log(e);
  }
};

export const cropPhoto = (imageUrl: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Allow loading images from different origins
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const minSize = Math.min(img.width, img.height);
      const squareSize = 200;
      const x = (img.width - minSize) / 2;
      const y = (img.height - minSize) / 2;
      canvas.width = squareSize;
      canvas.height = squareSize;
      ctx.drawImage(img, x, y, minSize, minSize, 0, 0, squareSize, squareSize);

      const croppedPhotoSrc = canvas.toDataURL();
      resolve(croppedPhotoSrc);
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = imageUrl;
  });
};

export function dataURLToBlob(dataURL: string) {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const intArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([arrayBuffer], { type: mimeString });
}

const connectionConfig = {
  iceServers: [
    {
      urls: [
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
      ],
    },
    {
      urls: "turn:your.turn.server:3478",
      username: "username",
      credential: "password",
    },
  ],
  iceCandidatePoolSize: 10,
}

export function registerPeerConnectionListeners(peerConnection) {
  peerConnection.addEventListener('icegatheringstatechange', () => {
    console.log(
        `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
  });

  peerConnection.addEventListener('connectionstatechange', () => {
    console.log(`Connection state change: ${peerConnection.connectionState}`);
  });

  peerConnection.addEventListener('signalingstatechange', () => {
    console.log(`Signaling state change: ${peerConnection.signalingState}`);
  });

  peerConnection.addEventListener('iceconnectionstatechange ', () => {
    console.log(
        `ICE connection state change: ${peerConnection.iceConnectionState}`);
  });
}

export const createRoom = async (newRoomRef, peerConnection, localStream, remoteStream)=>{
  let videoTrack, audioTrack;
  // console.log('Create PeerConnection with configuration: ', connectionConfig);
  peerConnection = new RTCPeerConnection(connectionConfig);
  // registerPeerConnectionListeners(peerConnection);
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
    if(track.kind === "video") videoTrack = track;
    if(track.kind === "audio") audioTrack = track;
  });

  // collect the ICE candidates
  const callerCandidatesCollection = collection(newRoomRef, "callerCandidates");
  peerConnection.addEventListener("icecandidate", event => {
    if(!event.candidate){
      // console.log("Got final candidate !");
      return;
    }
    addDoc(callerCandidatesCollection, event.candidate.toJSON());;
  });
  peerConnection.addEventListener("track", event => {
    // console.log('Got remote track:', event.streams[0]);
    event.streams[0].getTracks().forEach(track => {
      // console.log('Add a track to the remoteStream:', track);
      remoteStream.addTrack(track);
    })
  })

  // create a room
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  // console.log('Created offer:', offer);
  const roomWithOffer: Room = {
    id: newRoomRef.id,
    onCall: true,
    offer : {
      type: offer.type,
      sdp: offer.sdp
    }
  }
  await setDoc(newRoomRef, roomWithOffer);

  // listening for remote session description
  onSnapshot(newRoomRef, async (snapshot) => {
    const data = snapshot.data();
    if(!peerConnection.currentRemoteDescription && data && data.answer){
      // console.log('Got remote description: ', data.answer);
      const rtcSessionDescription = new RTCSessionDescription(data.answer);
      await peerConnection.setRemoteDescription(rtcSessionDescription);
    }
  });

  // listening for remote ICE candidates
  onSnapshot(collection(newRoomRef, "calleeCandidates"), snapshot => {
    snapshot.docChanges().forEach(async (change) => {
      if(change.type === "added"){
        let data = change.doc.data();
        // console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
        await peerConnection.addIceCandidate(new RTCIceCandidate(data));
      }
    })
  })
  return {videoTrack: videoTrack, audioTrack: audioTrack}
}

export const joinRoom = async (roomId, peerConnection, localStream, remoteStream) => {
  let videoTrack, audioTrack;
  const roomRef = doc(DB, "rooms", roomId)
  const roomDoc = await getDoc(roomRef);
  // console.log('Got room:', roomDoc.exists());
  if(roomDoc.exists()){
    // console.log('Create PeerConnection with configuration: ', connectionConfig);
    peerConnection = new RTCPeerConnection(connectionConfig);
    // registerPeerConnectionListeners(peerConnection);
    // console.log(localStream)
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
      if(track.kind === "video") videoTrack = track;
      if(track.kind === "audio") audioTrack = track;
    });

    // collecting ICE candidates
    const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');
    peerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate){
        // console.log('Got final candidate!');
        return;
      }
      // console.log('Got candidate: ', event.candidate);
      addDoc(calleeCandidatesCollection, event.candidate.toJSON());
    });

    peerConnection.addEventListener('track', event => {
      // console.log('Got remote track:', event.streams[0]);
      event.streams[0].getTracks().forEach(track => {
        // console.log('Add a track to the remoteStream:', track);
        remoteStream.addTrack(track);
      });
    });

    // creating SDP answer
    const offer = roomDoc.data().offer;
    // console.log('Got offer:', offer);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    // console.log('Created answer:', answer);
    await peerConnection.setLocalDescription(answer);
    const roomWithAnswer = {
      answer: {
        type: answer.type,
        sdp: answer.sdp
      }
    }
    await updateDoc(roomRef, roomWithAnswer);

    // listening for remote ICE candidates
    onSnapshot(collection(roomRef, "callerCandidates"), (snapshot)=>{
      snapshot.docChanges().forEach(async (change)=>{
        if(change.type === "added"){
          let data = change.doc.data();
          // console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      })
    })
  }
  return {videoTrack: videoTrack, audioTrack: audioTrack};
}
export const deleteRoom = async (roomId) => {
  if (roomId) {
    const roomRef = doc(DB, 'rooms', roomId);

    // Delete all documents in the 'calleeCandidates' subcollection
    const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');
    const calleeCandidatesSnapshot = await getDocs(calleeCandidatesCollection);
    for (const candidate of calleeCandidatesSnapshot.docs) {
      await deleteDoc(candidate.ref);
    }

    // Delete all documents in the 'callerCandidates' subcollection
    const callerCandidatesCollection = collection(roomRef, 'callerCandidates');
    const callerCandidatesSnapshot = await getDocs(callerCandidatesCollection);
    for (const candidate of callerCandidatesSnapshot.docs) {
      await deleteDoc(candidate.ref);
    }

    // Delete the room document
    await deleteDoc(roomRef);
    // console.log(`Room ${roomId} and its subcollections have been deleted.`);
  }
}