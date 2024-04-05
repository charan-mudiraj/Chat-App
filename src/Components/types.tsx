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
export interface UserConnection {
  userId: string;
  chatId: string;
  lastMessage: string;
  lastUpdated: string;
  lastMsgStatus: MessageStatus;
  lastUpdatedTime: string;
}
export interface User {
  id: string;
  name: string;
  status: string;
  profileImgUrl: string;
  connections: UserConnection[];
}
export interface GroupMember {
  userId: string;
  lastMsgStatus: MessageStatus;
  color: string;
}
export interface Group {
  id: string;
  name: string;
  groupImgUrl: string;
  lastUpdated: string;
  members: GroupMember[];
  lastMessage: string;
  lastUpdatedTime: string;
  lastMsgSenderId: string;
  lastMsgSenderName: string;
}
export interface SideScreenSchema {
  listId: string;
  isGroup: boolean;
  imageUrl: string;
  name: string;
  userId?: string;
  status: string;
}
