import { FC, useCallback } from "react";
import { LobbyState } from "../game/PlayerState";

const Lobby: FC<{ state: LobbyState }> = ({ state }) => {
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
export default Lobby;
