/** @jsxImportSource @emotion/react */
import React, { useRef } from "react";
import { css } from "@emotion/react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../Atom/Button";
import { Input } from "../Atom/Input";

const containerStyle = css`
  display: flex;
  margin: 0 auto;
  flex-direction: column;
  width: 300px;
  margin-top: 50px;
`;

const titleStyle = css`
  font-size: 64px;
  text-align: center;
  margin-bottom: 20px;
`;

const ButtonContainerStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SocialLoginButtonContainerStyle = css`
  div:nth-child(1) {
    margin-top: 20px;
  }
  div:nth-child(2) {
    margin: 10px 0;
  }
`;
export default function LogInPage() {
  const searchParams = new URLSearchParams(useLocation().search);
  const code = searchParams.get("code");
  const idRef = useRef(null);
  const pwRef = useRef(null);

  const clickLogin = async () => {
    if (idRef.current === null) return;
    if (pwRef.current === null) return;
    const id = (idRef.current as HTMLInputElement).value;
    const pw = (pwRef.current as HTMLInputElement).value;
    console.log(id);
    console.log(pw);
    const response = await fetch("http://localhost:4000/api/login", {
      method: "POST",
      headers: {
        credential: "include",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid: id, password: pw }),
    });
    const body = await response.json();
    console.log(body);
  };

  return (
    <>
      <div css={containerStyle}>
        <div css={titleStyle}>Sign in</div>
        <Input ref={idRef} placeholder="ID" autoComplete="off" />
        <Input ref={pwRef} placeholder="PW" type="password" autoComplete="off" />

        <div css={ButtonContainerStyle}>
          <Link to="/sub/Register">
            <Button type="Small">회원가입</Button>
          </Link>
          <Button type="Small" onClick={clickLogin}>
            로그인
          </Button>
        </div>

        {!code && (
          <div css={SocialLoginButtonContainerStyle}>
            <Button type="Long" color="#000000">
              Sign in with Github
            </Button>
            <Button type="Long" color="#f3e84d">
              Sign in with Kakao
            </Button>
            <Button type="Long" color="#2DB400">
              Sign in with Naver
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
