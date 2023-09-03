import { FC, useCallback } from "react";
import { CompletedState } from "../game/PlayerState";

const Completed: FC<{ state: CompletedState }> = ({ state }) => {
  const doRestartGame = state.controls?.restartGame;
  const restartGame = useCallback(() => {
    doRestartGame?.();
  }, [doRestartGame]);
  if (doRestartGame) {
    return (
      <>
        <div>{JSON.stringify(state)}</div>
        <button onClick={restartGame}>restart</button>
      </>
    );
  }
  return <div>{JSON.stringify(state)}</div>;
};
export default Completed;
