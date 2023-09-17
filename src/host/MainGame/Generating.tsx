import { FC } from "react";
import { GeneratingState } from "./ViewState";
import { Spinner, Flex, Text } from '@chakra-ui/react';
import PastWinnersDisplay from "../PastWinnersDisplay";

const Generating: FC<{ state: GeneratingState }> = ({ state }) => {
  
  return <Flex direction="column" align="center">
    <Spinner size="xl" mb="1em" />
    <Text fontSize="2xl">I'm judging you. Harshly.</Text>
    <Text fontSize="xl">While we wait, let's take a look at what <i>my</i> competition wore last time.</Text>
    <Text fontSize="xl">I'm sure you'll do better.</Text>
    <PastWinnersDisplay pastWinners={state.pastWinners} />
  </Flex>;
};
export default Generating;
