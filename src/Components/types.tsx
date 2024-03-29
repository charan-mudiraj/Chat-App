export interface Message {
  id: number;
  msg: string;
  msgStatus: MessageStatus;
  senderId: string;
  senderName: string;
  senderProfileImg: string;
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
  RECEIVED = "RECEIVED",
  SEEN = "SEEN",
}
export interface User {
  id: string;
  name: string;
  status: string;
  profileImgUrl: string;
}
export interface Group {
  id: string;
  name: string;
  groupImgUrl: string;
  lastUpdated: number;
  members: string[];
  lastMessage: string;
}
export interface SideScreenSchema {
  listId: string;
  isGroup: boolean;
  imageUrl: string;
  name: string;
}
