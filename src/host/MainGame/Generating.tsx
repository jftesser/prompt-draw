import { FC } from "react";
import { GeneratingState } from "./ViewState";
import { Spinner, Flex, Text } from '@chakra-ui/react';

const Generating: FC<{ state: GeneratingState }> = ({ state }) => {
  return <Flex direction="column" align="center">
    <Spinner size="xl" />
    <Text fontSize="2xl">I'm judging you. Harshly.</Text>
  </Flex>;
};
export default Generating;
