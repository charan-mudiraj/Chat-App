import logo from "../../logo.png";
import twitterIcon from "../assets/twitter-icon.png";
import linkedinIcon from "../assets/linkedin-icon.png";
import githubIcon from "../assets/github-icon.png";
import gmailIcon from "../assets/gmail-icon.png";

export default function About({ classes }: any) {
  return (
    <div
      className={
        classes + " " + "w-screen flex flex-col items-center justify-center"
      }
    >
      <img src={logo} className="h-20 opacity-90" />
      <p className="opacity-70 text-bold text-xl mt-2">Chat App</p>
      <p className="opacity-40 mt-1">
        A Web-based Chatting Application by{" "}
        <a
          href="https://twtr.openinapp.link/9sf91"
          className="hover:text-sky-400"
        >
          <b>Charan</b>
        </a>
      </p>
      <div className="flex gap-5 mt-3 border-zinc-700 border-t-2 pt-3 px-8">
        <a href="https://openinapp.link/9fpce" target="_blank">
          <img src={githubIcon} className="h-9" />
        </a>
        <a href="https://linkedin.openinapp.link/w381a" target="_blank">
          <img src={linkedinIcon} className="h-9" />
        </a>
        <a href="https://twtr.openinapp.link/9sf91" target="_blank">
          <img src={twitterIcon} className="h-9" />
        </a>
        <a href="mailto:r.charan.m.gm@gmail.com" target="_blank">
          <img src={gmailIcon} className="h-9 rounded-full" />
        </a>
      </div>
    </div>
  );
}
