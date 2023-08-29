import "./Display.scss";

import { PlayerState } from "../game/PlayerState";
import { FC } from "react";

const Display: FC<{ state: PlayerState }> = ({ state }) => {
  return <div>{JSON.stringify(state)}</div>;
};

export default Display;
