import "./Display.scss";

import { PlayerState } from "../game/PlayerState";
import { FC, useCallback } from "react";

const Display: FC<{ state: PlayerState }> = ({ state }) => {
  const doStartGame = state.controls?.startGame;
  const startGame = useCallback(() => {
    doStartGame?.();
  }, [doStartGame]);
  if (doStartGame) {
    return (
      <>
        <div>{JSON.stringify(state)}</div>
        <button onClick={startGame}>start</button>
      </>
    );
  }
  return <div>{JSON.stringify(state)}</div>;
};

export default Display;
