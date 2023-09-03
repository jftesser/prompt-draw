import { FC, useCallback } from "react";
import { LobbyState } from "../game/PlayerState";
import { Button, Spinner, Text } from '@chakra-ui/react';

const Lobby: FC<{ state: LobbyState }> = ({ state }) => {
  const doStartGame = state.controls?.startGame;
  const startGame = useCallback(() => {
    doStartGame?.();
  }, [doStartGame]);
  if (doStartGame) {
    return (
      <>
        {state.otherPlayers.length &&
          <>
            <Text fontSize="2xl">Check out who's here:</Text>
            {state.otherPlayers.map((player) => {
              return <Text key={player.uid} fontSize="2xl" fontWeight="bold">{player.name}</Text>;
            })}
          </>}
        <Button mt="1em" variant='outline' onClick={startGame}>let's get started</Button>
      </>
    );
  }
  return <>
    {state.otherPlayers.length ? <><Spinner /><Text  mt="1em" fontSize="2xl">Waiting for <strong>{state.otherPlayers[0].name}</strong> to start the game</Text></> : <Text>Waiting to start...</Text>}
  </>;
};
export default Lobby;
