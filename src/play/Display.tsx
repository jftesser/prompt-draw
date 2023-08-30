import "./Display.scss";

import { PlayerState } from "../game/PlayerState";
import { FC } from "react";
import Lobby from "./Lobby";
import Intro from "./Intro";
import Metaprompt from "./Metaprompt";
import { unreachable } from "../Utils";
import Completed from "./Completed";

const Display: FC<{ state: PlayerState }> = ({ state }) => {
  if (state.stage === "lobby") {
    return <Lobby state={state} />;
  }
  if (state.stage === "intro") {
    return <Intro state={state} />;
  }
  if (state.stage === "metaprompt") {
    return <Metaprompt state={state} />;
  }
  if (state.stage === "completed") {
    return <Completed state={state} />;
  }
  return unreachable(state);
};

export default Display;
