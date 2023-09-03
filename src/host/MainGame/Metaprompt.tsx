import { FC } from "react";
import { MetapromptState } from "./ViewState";
import { Heading, Text } from '@chakra-ui/react';

const Metaprompt: FC<{ state: MetapromptState }> = ({ state }) => {
  return <div>
    <Heading>Your challenge:</Heading>
    <Text fontSize="2xl">{state.metaprompt.metaprompt}</Text>
  </div>;
};
export default Metaprompt;
