import { useEffect, useState } from 'react'
import { IncommingCall as IncommingCallType, SideScreenSchema, User } from './types'
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { DB } from '../firestore/firestore';
import { PhoneIcon, UserCircleIcon } from '@heroicons/react/20/solid';
import { useSetRecoilState } from 'recoil';
import { defaultSideScreenValue, globalLoaderAtom, isSideScreenActiveAtom, sideScreenAtom } from '../atoms/atom';

function IncommingCall({call}: {call: IncommingCallType}) {
    const [caller, setCaller] = useState<User | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const setCurrentSideScreen = useSetRecoilState<SideScreenSchema>(sideScreenAtom);
    const setIsSideScreenActive = useSetRecoilState<boolean>(isSideScreenActiveAtom);
    const setIsLoading = useSetRecoilState<boolean>(globalLoaderAtom);

    useEffect(()=>{
        (async ()=>{
            const callerDoc = await getDoc(doc(DB, "users", call.callerId));
            if(callerDoc.exists()){
                setCaller(callerDoc.data() as User);
            }
        })();
        (async ()=>{
          const currentUserDoc = await getDoc(doc(DB, "users", window.localStorage.getItem("chatapp-user-id") as string));
          if(currentUserDoc.exists()){
            setCurrentUser(currentUserDoc.data() as User);
          }
        })();
    }, []);

    const rejectCall = async ()=>{
      await updateDoc(doc(DB, "users", window.localStorage.getItem("chatapp-user-id")), {incommingCall: {isRejected: true}});
    }
    const acceptCall = async ()=>{
      setIsLoading(true);
      setIsSideScreenActive(false);
      await updateDoc(doc(DB, "users", window.localStorage.getItem("chatapp-user-id")), {incommingCall: {isAccepted: true}});
      setCurrentSideScreen({
        ...defaultSideScreenValue,
        userId: caller.id,
        name: caller.name,
        imageUrl: caller.profileImgUrl,
        onCall: true,
        callType: currentUser.incommingCall.callType,
        isCaller: false
      });
      onSnapshot(doc(DB, "users", currentUser.id), (snapshot)=>{
        if(snapshot.exists()){
          const user = snapshot.data() as User;
          if(user.incommingCall.roomId){
            setIsLoading(false);
            setIsSideScreenActive(true);
          }
        }
      })
    }
  return (
    <div className="bg-black w-screen h-screen absolute bg-opacity-40 flex items-center justify-center z-10">
        <div className="bg-dark rounded-xl px-6 pb-6 pt-3 mx-10">
          <div className="flex flex-col items-center gap-2 pt-5 justify-center px-3">
            {caller && caller.profileImgUrl ? <img src={caller.profileImgUrl} className="h-40 rounded-full" /> : <UserCircleIcon className="h-20 mr-1 my-2 ml-2 border-white border-2 rounded-full" />}
            {caller ? <p>{caller.name}</p> : <p>Unknown User</p>}
            {currentUser && <p>{`Incomming ${currentUser.incommingCall.callType} Call`}</p>}
            <div className="flex gap-7 pt-4">
              <button className="bg-danger hover:bg-[#d12624] p-3 rounded-full h-fit" onClick={rejectCall}><PhoneIcon className="h-8 rotate-[135deg]"/></button>
              <button className="bg-green-500 hover:bg-[#13a147] p-3 rounded-full h-fit" onClick={acceptCall}><PhoneIcon className="h-8"/></button>
            </div>
          </div>
        </div>
      </div>
  )
}

export default IncommingCall