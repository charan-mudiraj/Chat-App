import { useEffect, useState } from 'react'
import { IncommingCall as IncommingCallType, User } from './types'
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { DB } from '../firestore/firestore';
import { PhoneIcon, UserCircleIcon } from '@heroicons/react/20/solid';

function IncommingCall({call}: {call: IncommingCallType}) {
    const [caller, setCaller] = useState<User | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
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
      await updateDoc(doc(DB, "users", window.localStorage.getItem("chatapp-user-id")), {incommingCall: {isIncomming: false}});
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
              <button className="bg-green-500 hover:bg-[#13a147] p-3 rounded-full h-fit"><PhoneIcon className="h-8"/></button>
            </div>
          </div>
        </div>
      </div>
  )
}

export default IncommingCall