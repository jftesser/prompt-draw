import "./Display.scss";

import { PlayerState } from "../game/PlayerState";
import { FC, useCallback } from "react";
import Lobby from "./Lobby";
import Intro from "./Intro";
import { unreachable } from "../Utils";
import Completed from "./Completed";
import WaitingForOtherPlayers from "./WaitingForOtherPlayers";
import GetPrompt from "./GetPrompt";
import Endgame from "./Endgame";
import { Text } from "@chakra-ui/react";

const Display: FC<{ state: PlayerState }> = ({ state }) => {
  const chooseState = useCallback(() => {
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
  }, [state]);
  return (<div className="full">
    <Text pos="fixed" right="0" top="0" fontSize="xl" p="1em">You are <strong>{state.self.name}.</strong></Text>
    {chooseState()}
  </div>);
};

export default Display;
