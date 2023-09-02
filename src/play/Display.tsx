import "./Display.scss";

import { PlayerState } from "../game/PlayerState";
import { FC } from "react";
import Lobby from "./Lobby";
import Intro from "./Intro";
import { unreachable } from "../Utils";
import Completed from "./Completed";
import WaitingForOtherPlayers from "./WaitingForOtherPlayers";
import GetPrompt from "./GetPrompt";
import Endgame from "./Endgame";

const Display: FC<{ state: PlayerState }> = ({ state }) => {
  if (state.stage === "lobby") {
    return <Lobby state={state} />;
  }
  if (state.stage === "intro") {
    return <Intro state={state} />;
  }
  if (state.stage === "getPrompt") {
    return <GetPrompt state={state} />;
  }
  if (state.stage === "waitingForOthers") {
    return <WaitingForOtherPlayers state={state} />;
  }
  if (state.stage === "endgame") {
    return <Endgame state={state} />;
  }
  if (state.stage === "completed") {
    return <Completed state={state} />;
  }
  return unreachable(state);
};

export default Display;
