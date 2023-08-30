import "./Display.scss";

import { PlayerState } from "../game/PlayerState";
import { FC } from "react";
import Lobby from "./Lobby";
import Intro from "./Intro";
import { unreachable } from "../utils";

const Display: FC<{ state: PlayerState }> = ({ state }) => {
  if (state.stage === "lobby") {
    return <Lobby state={state} />;
  }
  if (state.stage === "intro") {
    return <Intro state={state} />;
  }
  return unreachable(state);
};

export default Display;
