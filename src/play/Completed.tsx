import { FC, useCallback } from "react";
import { CompletedState } from "../game/PlayerState";
import { Button, Spinner, Text } from '@chakra-ui/react';

const Completed: FC<{ state: CompletedState }> = ({ state }) => {
  const doRestartGame = state.controls?.restartGame;
  const restartGame = useCallback(() => {
    doRestartGame?.();
  }, [doRestartGame]);
  if (doRestartGame) {
    return (
      <>
        <Text fontSize="2xl">Want to go again?</Text>
        <Button mt="1em" variant='outline' onClick={restartGame}>restart</Button>
      </>
    );
  }
  return <><Spinner size="xl" mb="1em"/><Text fontSize="2xl">Want to play again? Ask <strong>{state.otherPlayers[0].name}</strong> to restart the game.</Text></>;
};
export default Completed;
