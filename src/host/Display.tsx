import "./Display.scss";

import { State } from "../game/State";
import { FC } from "react";
import Lobby from "./Lobby";
import Intro from "./Intro";
import Metaprompt from "./Metaprompt";
import { unreachable } from "../Utils";

const Display: FC<{ state: State }> = ({ state }) => {
  if (state.stage === "lobby") {
    return <Lobby state={state} />;
  }
  if (state.stage === "intro") {
    return <Intro state={state} />;
  }
  if (state.stage === "metaprompt") {
    return <Metaprompt state={state} />;
  }
  return unreachable(state);
};

export default Display;
