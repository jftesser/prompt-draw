import { FC } from "react";
import { LobbyState } from "../game/State";
import { Heading, Text, Flex } from '@chakra-ui/react';
import CodeDisplay from "./CodeDisplay";

const Lobby: FC<{ state: LobbyState }> = ({ state }) => {
  return <>
    <Heading as='h1' fontSize={["4em", "6em", "10em"]} lineHeight="0.8">Welcome!</Heading>
    <Text fontSize="6xl">Room code: <strong><CodeDisplay text={state.gameId} /></strong></Text>
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
