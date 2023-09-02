import { FC } from "react";
import { EndgameState } from "../game/PlayerState";

const Endgame: FC<{ state: EndgameState }> = ({ state }) => {
  return <div>{JSON.stringify(state)}</div>;
};
export default Endgame;
