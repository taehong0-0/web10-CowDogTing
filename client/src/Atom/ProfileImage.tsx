/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { ProfileImageType } from "../util/type";
import meetingImage from "../assets/meetingImage.png";

const bigProfileImageStyle = css`
  width: 300px;
  height: 300px;
  border-radius: 150px;
`;
const smallProfileImageStyle = css`
  width: 100px;
  height: 100px;
  border-radius: 50px;
`;

const miniProfileImageStyle = css`
  width: 50px;
  height: 50px;
  border-radius: 25px;
`;

const profileImageStyle = (props: ProfileImageType) => css`
  ${props.type === "Big" && bigProfileImageStyle}
  ${props.type === "Small" && smallProfileImageStyle}
  ${props.type === "Mini" && miniProfileImageStyle}
  background-image: url(${meetingImage});
  background-size: cover;
  cursor: pointer;
`;

export const ProfileImage = styled.div`
  ${profileImageStyle}
`;
