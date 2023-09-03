import "./Display.scss";

import { State } from "../game/State";
import { FC, useCallback } from "react";
import Lobby from "./Lobby";
import Intro from "./Intro";
import { unreachable } from "../Utils";
import MainGame from "./MainGame";
import Completed from "./Completed";

const Display: FC<{ state: State }> = ({ state }) => {
  const chooseState = useCallback( () => {
    if (state.stage === "lobby") {
      return <Lobby state={state} />;
    }
    if (state.stage === "intro") {
      return <Intro state={state} />;
    }
    if (state.stage === "main") {
      return <MainGame state={state} />;
    }
    if (state.stage === "completed") {
      return <Completed state={state} />;
    }
  
    return unreachable(state);
  }, [state]);

  return (<div className="full">
    {chooseState()}
  </div>);
};

export default Display;
