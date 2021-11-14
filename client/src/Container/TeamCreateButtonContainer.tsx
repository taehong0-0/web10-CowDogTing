import { MouseEventHandler } from "react";
import { Link } from "react-router-dom";
import { Button } from "../Atom/Button";
import TeamButtonContainer from "../Organism/TeamButtonContainer";

export default function TeamCreateButtonContainer({ clickCreateButton }: { clickCreateButton: MouseEventHandler }) {
  return (
    <TeamButtonContainer>
      <Link to="/sub/teamSetting">
        <Button type="Medium" onClick={clickCreateButton}>
          생성
        </Button>
      </Link>
      <Link to="/sub/teamSetting">
        <Button type="Medium">삭제</Button>
      </Link>
    </TeamButtonContainer>
  );
}
