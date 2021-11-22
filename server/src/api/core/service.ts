import { app } from "./../../app";
import { Op, literal } from "sequelize";
import { Request } from "../../db/models/request";
import { Chat } from "../../db/models/chat";
import { Users } from "../../db/models/users";
import { Team } from "../../db/models/team";
import { sequelize } from "../../db/models";
import { createChatMessage, createChatRoom, createParticipant, findChatRoomInfo, findJoinChatRooms } from "../chat/service";
import { SocketMap } from "../../webSocket/socket";
import { validateTeam } from "../team/service";
import { findUser } from "../auth/service";
import { isNumber } from "../../util/utilFunc";
import { messageType } from "../../util/type";

const { QueryTypes } = require("sequelize");

export const findImage = async ({ imageID }: { imageID: string }) => {
  // imageID 에 대한 db 값 가져오기
};

export const findChatRoomNotReadNum = async ({ uid }: { uid: string }) => {
  const joinCathRoom = await findJoinChatRooms({ uid });
  const chatList = await Promise.all(
    joinCathRoom.map(async (RoomNum) => {
      return {
        ...RoomNum,
        notReadNum: await findAllChat(RoomNum),
      };
    }),
  );
  return chatList;
};

const findAllChat = async ({ chatRoomId }: { chatRoomId: number }) => {
  const query = {
    where: {
      isRead: 0,
      chatRoomId: chatRoomId,
    },
  };
  return await Chat.count(query);
};

export const findAllRequest = async ({ uid }: { uid: string }) => {
  const query_to = {
    attributes: ["from", "to", "state"],
    include: [
      {
        model: Users,
        as: "info",
        attributes: [["uid", "id"], "image", "location", "sex", "age", "info"],
      },
    ],
    where: {
      to: uid,
    },
  };
  const result_to = await Request.findAll(query_to as object);
  const query_from = `select * from Request inner join Users on Request.to = Users.uid where Request.from = "${uid}"`;
  const users = await sequelize.query(query_from, { type: QueryTypes.SELECT });
  const filtered = results_from(users);
  return [...result_to, ...filtered];
};

const findOneRequest = async ({ from, to, type }: { from: string; to: string; type: string }) => {
  const toQuery = {
    attributes: ["from", "to", "state"],
    include: [
      {
        model: Users,
        as: "info",
        attributes: [["uid", "id"], "image", "location", "sex", "age", "info"],
      },
    ],
    where: {
      [Op.and]: [{ from, to }],
    },
  };
  const fromQuery = `select * from Request inner join Users on Request.to = Users.uid where Request.from = "${from}" AND Request.to="${to}"`;
  if (type === "to") {
    const result_to = await Request.findOne(toQuery as object);
    return result_to;
  }
  if (type === "from") {
    const result_from = await sequelize.query(fromQuery, { type: QueryTypes.SELECT });
    return result_from_data(result_from[0]);
  }
};

const findTeamRequest = async ({ from, to, type }: { from: number; to: number; type: string }) => {
  const query = {
    attributes: ["gid", ["name", "id"], "image", "location", ["description", "info"]],
    include: [
      {
        model: Users,
        as: "member",
        attributes: [["uid", "id"], "image", "location", "sex", "age", "info"],
      },
    ],
    where: { gid: type === "to" ? to : from },
  };
  const infoData = await Team.findAll(query as object);
  return { from, to, type, info: infoData };
};

export const results_from = (users: any[]) => {
  return users.map((user) => result_from_data(user));
};

export const result_from_data = (user: any) => {
  return {
    from: user.from,
    to: user.to,
    state: user.state,
    info: {
      id: user.uid,
      image: user.image,
      location: user.location,
      sex: user.sex,
      age: user.age,
    },
  };
};

export const findUserInfo = async ({ uid }: { uid: string }) => {
  const query = {
    attributes: [["uid", "id"], "image", "location", "sex", "age", "info", "gid"],
    where: { uid },
  };
  return await Users.findOne(query as object);
};

export const findAllProfile = async (person: number, index: number, myId: string) => {
  let query;
  if (person === 1) {
    query = {
      raw: true,
      attributes: [["uid", "id"], "image", "location", "sex", "age", "info"],
      where: { uid: { [Op.ne]: myId } },
      offset: 10 * index,
      limit: 10,
    };
    return await Users.findAll(query as object);
  } else {
    const teamIds = await findTeam(person, myId);
    query = {
      attributes: ["gid", ["name", "id"], "image", "location", ["description", "info"]],
      include: [
        {
          model: Users,
          as: "member",
          attributes: [["uid", "id"], "image", "location", "sex", "age", "info"],
        },
      ],
      where: { gid: { [Op.in]: teamIds } },
      offset: 10 * index,
      limit: 10,
    };
    const data = await Team.findAll(query as object);
    return data;
  }
};

const findTeam = async (person: number, myId: string) => {
  const query = {
    raw: true,
    attributes: ["gid"],
    include: [
      {
        model: Users,
        as: "member",
        attributes: [],
      },
    ],
    where: literal(`Team.gid != (SELECT gid from Users WHERE uid='${myId}')`),
    group: ["member.gid"],
    having: literal(`COUNT(member.uid) = ${person}`),
    logging: true,
  };
  const resultArr = await Team.findAll(query as object);
  const teamId = resultArr.map((result) => {
    return result.gid;
  });
  return teamId;
};

export const updateUser = async (oldId: string, { uid, location, age, info }: { uid: string; location: string; age: number; info: string }) => {
  await Users.update({ uid, location, age, info }, { where: { uid: oldId } });
};

export const addRequest = async ({ from, to }: { from: string; to: string }) => {
  return await Request.create({ from, to, state: "ready" });
};

export const sendRequest = ({ from, to }: { from: string; to: string }) => {
  if (isNumber(to)) {
    sendRequestToTeam({ from: Number(from), to: Number(to) });
  } else {
    sendRequestToUser({ from, to });
  }
};

const sendRequestToTeam = async ({ from, to }: { from: number; to: number }) => {
  const io = app.get("io");

  const toMemberList = await findMembers(to);
  const fromMemberList = await findMembers(from);
  const fromRequestData = await findTeamRequest({ from, to, type: "from" });
  const toRequestData = await findTeamRequest({ from, to, type: "to" });

  toMemberList.forEach((toMember) => {
    const toSocketId = SocketMap.get(String(toMember));
    io.to(toSocketId).emit("receiveRequest", toRequestData);
  });
  fromMemberList.forEach((fromMember) => {
    const fromSocketId = SocketMap.get(String(fromMember));
    io.to(fromSocketId).emit("receiveRequest", fromRequestData);
  });
};

const findMembers = async (gid: number) => {
  const query = {
    attributes: ["uid"],
    where: { gid },
  };
  const memberList = await Users.findAll(query);
  return memberList;
};

const sendRequestToUser = async ({ from, to }: { from: string; to: string }) => {
  const io = app.get("io");
  const fromSocketId = SocketMap.get(from);
  const fromRequestData = await findOneRequest({ from, to, type: "from" });
  io.to(fromSocketId).emit("receiveRequest", fromRequestData);
  if (!SocketMap.has(to)) return;

  const toSocketId = SocketMap.get(to);
  const toRequestData = await findOneRequest({ from, to, type: "to" });
  io.to(toSocketId).emit("receiveRequest", toRequestData);
};

export const validationTeamAndUser = async (to: string) => {
  if (isNumber(to)) {
    return await validateTeam({ gid: Number(to) });
  }
  return await findUser({ uid: to });
};

export const _denyRequest = async ({ from, to }: { from: string; to: string }) => {
  if (isNumber(to)) {
    denyRequestTeam({ from: Number(from), to: Number(to) });
  } else {
    denyRequestUser({ from, to });
  }
};

const denyRequestTeam = async ({ from, to }: { from: number; to: number }) => {
  await deleteRequest({ from: String(from), to: String(to) });
};

const denyRequestUser = async ({ from, to }: { from: string; to: string }) => {
  await deleteRequest({ from, to });
  const io = app.get("io");
  const toSocketId = SocketMap.get(to);
  io.to(toSocketId).emit("receiveDenyRequest", { from, to });
  if (!SocketMap.has(from)) return;
  const fromSocketId = SocketMap.get(from);
  io.to(fromSocketId).emit("receiveDenyRequest", { from, to });
};

const deleteRequest = async ({ from, to }: { from: string; to: string }) => {
  return await Request.destroy({
    where: {
      [Op.and]: [{ from, to }],
    },
  });
};

export const _acceptRequest = async ({ from, to }: { from: string; to: string }) => {
  if (isNumber(to)) {
    acceptRequestTeam({ from: Number(from), to: Number(to) });
  } else {
    acceptRequestUser({ from, to });
  }
};

const acceptRequestTeam = async ({ from, to }: { from: number; to: number }) => {
  await deleteRequest({ from: String(from), to: String(to) });
};

const acceptRequestUser = async ({ from, to }: { from: string; to: string }) => {
  await deleteRequest({ from, to });
  const createdChatRoom = await createChatRoom();
  const chatRoomId = createdChatRoom.get({ plain: true }).chatRoomId;
  const createdParticipant = await createParticipant({ from, to, chatRoomId });
  const createdChatMessage = await createChatMessage({ chatRoomId, message: makeMessageObject({ from, to, message: `${to}가 채팅을 수락했습니다.` }) });
  const chatRoomData = await findChatRoomInfo({ chatRoomId });
  const io = app.get("io");
  const fromSocketId = SocketMap.get(from);
  io.to(fromSocketId).emit("receiveAcceptRequest", { chat: chatRoomData, from, to });
  if (!SocketMap.has(to)) return;
  const toSocketId = SocketMap.get(to);
  io.to(toSocketId).emit("receiveAcceptRequest", { chat: chatRoomData, from, to });
};

const makeMessageObject = ({ from, to, message }: { from: string; to: string; message: string }): messageType => {
  return {
    from: to,
    message,
    read: false,
  };
};
