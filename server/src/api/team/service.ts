import { Team } from "../../db/models/team";
import { Users } from "../../db/models/users";

export const findTeam = async ({ gid }) => {
  const query = {
    raw: true,
    where: { gid: 1 },
    include: [
      {
        model: Users,
      },
    ],
  };
  const teamInfos = await Team.findAll(query);
  console.log(teamInfos);
  const memberInfo = teamInfos.map((info) => {
    return { id: info["User.uid"], image: info["User.image"], location: info["User.location"], age: info["User.age"], sex: info["User.sex"] };
  });
  const teamInfo = teamInfos[0];
  const filteredTeamInfo = { image: teamInfo.image, id: teamInfo.name, info: teamInfo.description, location: teamInfo.location, leader: teamInfo.leader, member: memberInfo };
  return filteredTeamInfo;
};

export const _createTeam = async ({ teamInfo }) => {
  return await Team.create(teamInfo);
};
export const _updateTeam = async ({ teamInfo }) => {
  const originTeamName = teamInfo.originTeamName;
  const { gid } = await _getGroupId({ teamName: originTeamName });
  const { name, description, location, leader } = teamInfo;
  const updateTeamInfo = { name, description, location, leader };
  console.log(updateTeamInfo);

  try {
    await Team.update(updateTeamInfo, { where: { gid } });
    return "success";
  } catch (error) {
    return new Error("업데이트 실패");
  }
};
export const _inviteTeam = async ({ inviteInfo }) => {
  const { gid } = await _getGroupId({ teamName: inviteInfo.teamName });
  try {
    await Users.update({ gid }, { where: { uid: inviteInfo.userId } });
    return "success";
  } catch (error) {
    return new Error("업데이트 실패");
  }
};

export const _getGroupId = async ({ teamName }) => {
  const query = {
    raw: true,
    attributes: ["gid"],
    where: { name: teamName },
  };
  return await Team.findOne(query);
};
