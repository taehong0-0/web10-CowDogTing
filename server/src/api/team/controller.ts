import { NextFunction, Request, Response } from "express";
import { _createTeam, findTeam, _updateTeam, _inviteTeam } from "./service";

export const getTeamInfo = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.send({ error: "로그인 안했음" });
  const gid = Number(req.user.gid);
  if (gid === null) return res.send({ error: "팀 없음" });
  try {
    const data = await findTeam({ gid });
    if (!data) return res.send({ error: "팀 찾기 실패" });
    return res.send(data);
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (req: Request, res: Response, next: NextFunction) => {
  const teamInfo = req.body;
  if (!req.user) return res.send({ error: "로그인 하지 않음" });
  try {
    const { uid } = req.user;
    const result = await _createTeam({ ...teamInfo, leader: uid });
    if (!result) return res.send({ error: "팀 생성 실패" });
    return res.send({ gid: result });
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req: Request, res: Response, next: NextFunction) => {
  const teamInfo = req.body;
  if (!req.user) return res.send({ error: "로그인 되어있지 않음" });
  const { gid } = req.user;
  try {
    const result = await _updateTeam({ gid, ...teamInfo });
    if (!result) return res.send({ error: "팀 수정 실패" });
    const data = { id: teamInfo.name, info: teamInfo.description, location: teamInfo.location };
    return res.send(data);
  } catch (error) {
    next(error);
  }
};

export const inviteTeam = async (req: Request, res: Response, next: NextFunction) => {
  const inviteInfo = req.body;
  if (!req.user) return res.status(400).send({ error: "로그인 되어있지 않음" });
  const gid = Number(req.user.gid);
  const { userId } = inviteInfo;
  try {
    const result = await _inviteTeam({ gid, userId });
    if (!result) return res.status(401).send({ error: "팀 초대 실패" });
    return res.status(200).send({ success: "팀 초대  성공" });
  } catch (error) {
    next(error);
  }
};
