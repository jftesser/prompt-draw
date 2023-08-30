import { FC } from "react";
import { MainGameState } from "../game/State";

const MainGame: FC<{ state: MainGameState }> = ({ state }) => {
  return <div>{JSON.stringify(state)}</div>;
};
export default MainGame;
