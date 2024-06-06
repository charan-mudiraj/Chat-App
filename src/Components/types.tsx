export enum FileType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  OTHER = "OTHER",
}
export interface FileDetails {
  type: FileType;
  url: string;
  name: string;
  ext: string;
  size: number;
}
export interface Message {
  id: number;
  msg: string;
  msgStatus: MessageStatus;
  senderId: string;
  senderName: string;
  senderProfileImg: string;
  time: string;
  isFile: boolean;
  fileDetails?: FileDetails;
}
export class Queue {
  private list: Message[];
  constructor() {
    this.list = [];
  }
  enqueue(x: Message) {
    this.list.push(x);
  }
  dequeue() {
    if (this.isEmpty()) {
      return -1;
    }
    return this.list.shift();
  }
  isEmpty() {
    if (this.list.length == 0) {
      return true;
    }
    return false;
  }
}
export enum MessageStatus {
  WAITING = "WAITING",
  SENT = "SENT",
  SEEN = "SEEN",
}
interface LastMessage {
  lastUpdated: string;
  lastMessage: string;
  lastUpdatedTime: string;
  lastMsgSenderId: string;
  lastMsgSenderName: string;
}
export interface UserConnection extends LastMessage {
  userId: string;
  chatId: string;
  lastMsgStatus: MessageStatus;
}
export interface IncommingCall{
  isIncomming: boolean;
  isRejected: boolean;
  isAccepted: boolean;
  callType: CallType;
  callerId: string;
  roomId: string;
}
export interface User {
  id: string;
  name: string;
  status: string;
  profileImgUrl: string;
  connections: UserConnection[];
  isOnline: boolean;
  incommingCall?: IncommingCall
}
export interface GroupMember {
  userId: string;
  lastMsgStatus: MessageStatus;
  color: string;
}
export interface Group extends LastMessage {
  id: string;
  name: string;
  groupImgUrl: string;
  members: GroupMember[];
}
export enum CallType{
  Video = "video",
  Audio = "audio"
}
export interface SideScreenSchema {
  listId: string;
  isGroup: boolean;
  imageUrl: string;
  name: string;
  userId?: string;
  status: string;
  onCall: boolean;
  callType?: CallType;
  isCaller?: boolean; // true for caller and false for reciever
  isOnline: boolean;
}
export interface Room {
  id: string,
  onCall: boolean,
  offer: {
    type: RTCSdpType,
    sdp: string
  },
  answer?: {
    type: RTCSdpType,
    sdp: string
  }
}