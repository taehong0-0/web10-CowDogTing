/* eslint-disable consistent-return */
/* eslint-disable spaced-comment */
/* eslint-disable no-console */
import React, { useEffect } from "react";
import { Global } from "@emotion/react";
import { Redirect, Route, Switch } from "react-router";
import { useRecoilState, useSetRecoilState } from "recoil";
import Footer from "./Molecules/Core/Footer";
import ErrorModal from "./Template/Modal/ErrorModal";
import MainPage from "./Page/MainPage";
import Page from "./Page/Page";
import ChatRoom from "./Page/ChatRoom";
import ClientSocket from "./Socket";
import { handleReceiveAcceptSocket, handleReceiveChatSocket, handleReceiveDenySocket, handleReceiveRequestSocket } from "./Socket/chatSocket";
import { ChatInfoType, RequestType, MessageType } from "./util/type";
import { CHAT_INFO_URL, JOIN_CHAT_URL, REQUEST_URL, USER_URL } from "./util/URL";
import { getFetch } from "./util/data";
import reset from "./util/reset";
import { chatsState, chatTarget, joinChatRoomState, requestState, userState } from "./Recoil/Atom";

function App() {
  const [user, setUser] = useRecoilState(userState);
  const setRequest = useSetRecoilState(requestState);
  const [joinChat, setJoinChat] = useRecoilState(joinChatRoomState);
  const setChat = useSetRecoilState(chatsState);
  const setChatInfo = useSetRecoilState(chatTarget);

  const getInitData = async () => {
    try {
      const userData = await getFetch({ url: USER_URL, query: "" });
      const requestData = await getFetch({ url: REQUEST_URL, query: "" });
      const joinChatData = await getFetch({ url: JOIN_CHAT_URL, query: "" });
      const chatData = await getFetch({ url: CHAT_INFO_URL, query: "" });
      setUser(userData);
      setRequest(requestData);
      setJoinChat(joinChatData);
      setChat(chatData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user.id === "") return;
    const socket = new ClientSocket(user.id);

    const handleReceiveRequestEvent = (data: RequestType) => {
      console.log(data);
      handleReceiveRequestSocket({ setRequest, data });
    };
    const handleReceiveDenyEvent = (data: { from: string; to: string }) => {
      handleReceiveDenySocket({ setRequest, data });
    };
    const handleReceiveAcceptEvent = (data: { chat: ChatInfoType; from: string; to: string }) => {
      handleReceiveAcceptSocket({ setRequest, setJoinChat, setChat, data });
    };
    const handleReceiveChatEvent = (data: { message: MessageType; chatRoomId: number }) => {
      handleReceiveChatSocket({ setJoinChat, setChat, setChatInfo, data });
    };

    socket.addEvent({ handleReceiveRequestEvent, handleReceiveDenyEvent, handleReceiveAcceptEvent, handleReceiveChatEvent, joinChat });
    return () => {
      socket.deleteEvent({ handleReceiveRequestEvent, handleReceiveDenyEvent, handleReceiveAcceptEvent, handleReceiveChatEvent });
    };
  }, [joinChat]);

  useEffect(() => {
    if (user.id === "") {
      return;
    }
    // eslint-disable-next-line no-new
    new ClientSocket(user.id);
  }, [user]);

  useEffect(() => {
    getInitData();
  }, []);

  return (
    <>
      <Global styles={reset} />
      <Switch>
        <Route path="/main" component={MainPage} />
        <Route path="/sub" component={Page} />
        <Route path="/ChatRoom" component={ChatRoom} />
        <Redirect path="*" to="/main" />
      </Switch>
      <Footer />
      <ErrorModal />
    </>
  );
}

export default App;
