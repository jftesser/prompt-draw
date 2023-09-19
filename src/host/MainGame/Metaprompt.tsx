import { FC } from "react";
import { MetapromptState } from "./ViewState";
import { Heading, Text } from '@chakra-ui/react';
import Speak from "../../Speak";

const Metaprompt: FC<{ state: MetapromptState }> = ({ state }) => {
  return <div>
    <Heading fontSize={["4em", "6em", "10em"]} lineHeight="0.8">Your challenge:</Heading>
    <Speak>
      <Text fontSize="4xl" mt="1em">{state.metaprompt.metaprompt}</Text>
    </Speak>
  </div>;
};
export default Metaprompt;
