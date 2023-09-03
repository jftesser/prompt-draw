import { FC, useCallback } from "react";
import { LobbyState } from "../game/PlayerState";
import { Button } from '@chakra-ui/react';

const Lobby: FC<{ state: LobbyState }> = ({ state }) => {
  const doStartGame = state.controls?.startGame;
  const startGame = useCallback(() => {
    doStartGame?.();
  }, [doStartGame]);
  if (doStartGame) {
    return (
      <>
        <div>{JSON.stringify(state)}</div>
        <Button onClick={startGame}>start</Button>
      </>
    );
  }
  return <div>{JSON.stringify(state)}</div>;
};
export default Lobby;
