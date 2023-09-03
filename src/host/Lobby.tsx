import { FC } from "react";
import { LobbyState } from "../game/State";
import { Heading, Text, Flex } from '@chakra-ui/react';

const Lobby: FC<{ state: LobbyState }> = ({ state }) => {
  return <>
    <Heading as='h1' size='4xl'>Welcome!</Heading>
    <Text fontSize="6xl">Room code: <strong>{state.gameId}</strong></Text>
    {state.players.length > 0 && <Text fontSize="2xl">Check out who's here:</Text>}
    {state.players.map((player) => {
      return <Flex key={player.uid}>
        <Text fontSize="2xl" fontWeight="bold">{player.name}</Text>
      </Flex>;
    })
    }
  </>;
};
export default Lobby;
