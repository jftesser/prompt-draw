import { FC } from "react";
import { CompletedState } from "../game/State";
import { Heading, Text } from '@chakra-ui/react';

const Completed: FC<{ state: CompletedState }> = ({ state }) => {
  return <>
  <Heading size="4xl" mb="0.5em">That's all folks!</Heading>
  <Text fontSize="2xl">Congrats to {state.winner.name}! You did slightly better than everyone else. Don't forget, though, there's room for improvement.</Text>
  </>;
};
export default Completed;
