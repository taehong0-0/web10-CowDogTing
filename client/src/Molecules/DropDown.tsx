/* eslint-disable prettier/prettier */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable dot-notation */
/* eslint-disable comma-dangle */
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { Button } from "../Atom/Button";

interface DropDownProps {
  type: string;
  className: string;
}
const MenuStyle = css`
  display: flex;
  flex-direction: column;
  width: 300px;
  box-sizing: border-box;
  .hide {
    display: none;
  }
  .show {
    display: flex;
  }
  div {
    &:first-child {
      border-top-left-radius: 27px;
      border-top-right-radius: 27px;
    }
    &:last-child {
      border-bottom-left-radius: 27px;
      border-bottom-right-radius: 27px;
    }
  }
`;
const SearchData = {
  location: ["서울", "경기", "인천", "대구", "대전", "광주", "부산", "울산"],
  age: ["10대", "20대", "30대"],
  category: ["보드게임", "등산", "게임", "술", "방탈출"],
};
export default function DropDown(props: DropDownProps) {
  switch (props.type) {
    case "Menu":
      return MenuDropDown(props.className);
    case "User":
      return UserDropDown(props.className);
    case "location":
      return SearchDropDown(SearchData.location, props.className);
    case "age":
      return SearchDropDown(SearchData.age, props.className);
    default:
      return SearchDropDown(SearchData.category, props.className);
  }
}
const MenuDropDown = (className: string) => {
  return (
    <div css={MenuStyle} onClick={(e) => e.stopPropagation()} className={className}>
      <Button type="LargeDropDown">공지사항</Button>
      <Button type="LargeDropDown">소개팅 하러가기</Button>
      <Button type="LargeDropDown">미팅 하러가기</Button>
      <Button type="LargeDropDown">이벤트</Button>
      <Button type="LargeDropDown">문의하기</Button>
    </div>
  );
};
const UserDropDown = (className: string) => {
  return (
    <div css={MenuStyle} onClick={(e) => e.stopPropagation()} className={className}>
      <Button type="LargeDropDown">내 정보 보기</Button>
      <Button type="LargeDropDown">내가 고른 이상형</Button>
      <Button type="LargeDropDown">팀 설정하기</Button>
    </div>
  );
};
const SearchDropDown = (DropDownList: Array<string>, className: string) => {
  return (
    <div css={MenuStyle} onClick={(e) => e.stopPropagation()} className={className}>
      {DropDownList.map((el) => (
        <Button type="LargeDropDown">{el}</Button>
      ))}
    </div>
  );
};
