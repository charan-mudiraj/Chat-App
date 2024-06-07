# Chat App - [Live Link](https://chat-app-by-charan.vercel.app/) - [Demo Link](https://www.youtube.com/watch?v=5_Ouh0Q_aQo) - [Blog Post](https://blogsbycharan.hashnode.dev/how-to-build-a-chat-app)

A Chatting Web Application similar to [WhatsApp](https://web.whatsapp.com/) where users can share messages, images, videos, and any other files with a single (or) multiple recipients and make calls (Audio/Video) with P2P WebRTC Connection.

# Features

- Unique Chat room for every pair of users. (End-to-End)
- Unique Chat room for a selected set of users. (Groups)
- Sharing Image, Video, and any other File.
- Realtime Messaging with Status Indicators:
  - Waiting - <img src="./src/assets/clock.png" height="15px">
  - Sent - <img src="./src/assets/sent.png" height="15px">
  - Seen - <img src="./src/assets/seen.png" height="15px">
- One-to-One Audio/Video Calling (Peer-to-Peer WebRTC)
- User Online/Offline Status Indicator:
  - 🟢 - Online
  - NA - Offline
- Last-Updated-Time and Last-Message on every Chat Opening Bar.
- Usage of Queue Data Structure to Synchronize Messages and avoid Race Condition.
- Ordering the Chats (Groups and Profiles) based on Last-Updated-Time.
- New-unseen-message Indicator. (Notification)
- **Responsive Design** - Split Pages View for Large (and) Single Page View for Small Screen Sizes.

# Tech Stack Used

- ReactJS Framework
- RecoilJS - For Global State Management
- TypeScript - For Custom Types
- Firestore DB (and) Firestore Storage
- TailwindCSS
- WebRTC - For P2P Audio/Video Calling
- Heroicons

# Pages / Views

1. Welcome Screen

![](./views/1.png)

<!-- (update this) -->

2. Personal Chat Screen

![](./views/2.png)

3. Group Chat Screen

![](./views/3.png)

4. Add-Group Screen

![](./views/4.png)

5. Video Call Screens

![](./views/9.png)
![](./views/10.png)

6. Audio Call Screens

![](./views/7.png)
![](./views/8.png)

7. Mobile View Chat Screen

![](./views/5.png)

8. Mobile View Chats List Screen

![](./views/6.png)

9. Mobile View Voice Call

![](./views/11.png)
