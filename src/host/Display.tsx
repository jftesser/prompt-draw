import "./Display.scss";

import { State } from "../game/State";
import { FC } from "react";
import Lobby from "./Lobby";
import Intro from "./Intro";
import { unreachable } from "../Utils";
import MainGame from "./MainGame";

const Display: FC<{ state: State }> = ({ state }) => {
  if (state.stage === "lobby") {
    return <Lobby state={state} />;
  }
  if (state.stage === "intro") {
    return <Intro state={state} />;
  }
  if (state.stage === "main") {
    return <MainGame state={state} />;
  }
  return unreachable(state);
};

export default Display;
