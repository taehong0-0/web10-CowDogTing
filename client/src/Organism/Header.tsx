/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import MainHeaderLogo from "../Atom/MainHeaderLogo";
import Menu from "../Atom/Menu";
import UserIcon from "../Atom/UserIcon";
import useDropDownEvent from "../Hook/useDropDownEvent";
import DropDown from "../Molecules/DropDown";
import LinkButton from "../Molecules/LinkButton";
import { userState } from "../Recoil/Atom";
import { logOutUser } from "../util";

const HeaderStyle = css`
  display: flex;
  justify-content: space-between;
  width: 100vw;
  margin-top: 50px;
  border-bottom: 1px solid black;
  padding: 40px;
  .hide {
    display: none;
  }
  .show {
    display: flex;
  }
`;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);

  const userInfo = useRecoilValue(userState);
  const { id } = userInfo;

  const menuRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useDropDownEvent(menuRef, () => {
    setMenuOpen(false);
    setMeetingOpen(false);
  });
  useDropDownEvent(userRef, () => setUserOpen(false));

  const ToggleMenuModal = () => {
    setMenuOpen((isOpen) => !isOpen);
    setMeetingOpen(false);
  };
  const ToggleMeetingModal = () => {
    setMeetingOpen((isOpen) => !isOpen);
  };
  const ToggleUserModal = () => {
    setUserOpen((isOpen) => !isOpen);
  };

  const LogOut = async () => {
    const data = await logOutUser();
    if (data) {
      window.location.replace("/main");
    } else {
      alert("실패 ㅋㅋ");
    }
  };

  return (
    <div css={HeaderStyle} id="header">
      <div ref={menuRef}>
        <Menu onClick={() => ToggleMenuModal()} />
        <DropDown type="Menu" className={menuOpen ? "show" : "hide"} onClick={() => ToggleMeetingModal()} />
        <DropDown type="Meeting" className={meetingOpen ? "show" : "hide"} />
      </div>
      <Link to="/main">
        <MainHeaderLogo />
      </Link>
      {id === "" ? (
        <LinkButton url="/sub/login" type="Small" content="로그인" />
      ) : (
        <div ref={userRef}>
          <UserIcon onClick={() => ToggleUserModal()} />
          <DropDown type="User" className={userOpen ? "show" : "hide"} onClick={() => LogOut()} />
        </div>
      )}
    </div>
  );
}
