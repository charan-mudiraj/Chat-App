import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./output.css";
import { RecoilRoot } from "recoil";
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <RecoilRoot>
      <Routes>
        <Route path="/" element={<App />}></Route>
      </Routes>
    </RecoilRoot>
  </BrowserRouter>
);
