import { FC, useCallback } from "react";
import { CompletedState } from "../game/PlayerState";
import { Button } from '@chakra-ui/react';

const Completed: FC<{ state: CompletedState }> = ({ state }) => {
  const doRestartGame = state.controls?.restartGame;
  const restartGame = useCallback(() => {
    doRestartGame?.();
  }, [doRestartGame]);
  if (doRestartGame) {
    return (
      <>
        <div>{JSON.stringify(state)}</div>
        <Button onClick={restartGame}>restart</Button>
      </>
    );
  }
  return <div>{JSON.stringify(state)}</div>;
};
export default Completed;
