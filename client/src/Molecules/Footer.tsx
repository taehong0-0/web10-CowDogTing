/** @jsxImportSource @emotion/react */
import { useRef, useState } from "react";
import { css } from "@emotion/react";
import ChatIcon from "../Atom/ChatIcon";
import useDropDownEvent from "../Hook/useDropDownEvent";
import DropDown from "./DropDown";

const FooterStyle = css`
  z-index: 998;
  position: fixed;
  left: 95vw;
  top: 90vh;
  .hide {
    display: none;
  }
  .show {
    display: block;
  }
`;
export default function Footer() {
  const [chatDropDown, setChatDropDown] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useDropDownEvent(chatRef, () => setChatDropDown(false));
  const ToggleChatDropDown = () => {
    setChatDropDown((isOpen) => !isOpen);
  };
  return (
    <div css={FooterStyle} ref={chatRef}>
      <DropDown type="Chat" className={chatDropDown ? "show" : "hide"} />
      <ChatIcon onClick={ToggleChatDropDown} />
    </div>
  );
}
