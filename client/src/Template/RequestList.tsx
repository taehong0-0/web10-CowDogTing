/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/** @jsxImportSource @emotion/react */
import React from "react";
import { css } from "@emotion/react";
import ProfileCard from "../Atom/ProfileCard";
import ProfileInfo from "../Atom/ProfileInfo";
import { RequestListType } from "../util/type";
import { CardButton } from "../Atom/RequestButton";

const ProfileListStyle = css`
  margin: 0 auto;
  width: 70%;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-bottom: 10px;
  height: 100vh;
`;
const ProfileSideStyle = css`
  display: flex;
  height: 60%;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  margin-left: 10px;
`;
const ProfileStyle = css`
  display: flex;
  align-items: center;
  max-height: 200px;
  margin: 30px 0px;
`;

export default function RequestList({ datas, person, setOpenModal, type, profileRef }: RequestListType) {
  const handleModalClick = (e: React.MouseEvent) => {
    if (profileRef.current === null) {
      setOpenModal(null);
      return;
    }
    const target: HTMLElement = e.target as HTMLElement;
    const clickCard = profileRef.current
      .map((ref) => {
        if (ref.contains(target)) return ref;
        return null;
      })
      .filter((ref) => ref !== null)[0];

    if (!clickCard) {
      setOpenModal(null);
      return;
    }

    const { id } = clickCard.dataset;

    setOpenModal((prev: number) => (prev === Number(id) ? null : Number(id)));
  };
  return (
    <div css={ProfileListStyle} onClick={handleModalClick}>
      {datas?.map((data, idx): React.ReactElement | undefined => {
        const sex = person > 1 ? "team" : data.info.sex;
        return (
          <div css={ProfileStyle} ref={(el) => ((profileRef.current as HTMLDivElement[])[idx] = el as HTMLDivElement)} data-id={idx}>
            <ProfileCard type={sex}>
              <ProfileInfo data={data.info} />
            </ProfileCard>
            <div css={ProfileSideStyle}>{CardButton(type, data.state)}</div>
          </div>
        );
      })}
      <div css={ProfileStyle} /> {/* css용으로 넣어둠... 갑자기 이상하게 보여서..나는.. 디자이너가 아닌데... */}
    </div>
  );
}
