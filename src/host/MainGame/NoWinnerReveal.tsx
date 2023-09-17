import { FC } from "react";
import { NoWinnerRevealState } from "./ViewState";
import { Button, Flex, Text, Heading } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';

const NoWinnerReveal: FC<{ state: NoWinnerRevealState }> = ({ state }) => {
  return (
    <>
      <Heading fontSize={["4em", "6em"]} lineHeight="0.8" mb="0.5em" alignSelf="start">I am disappointed. There is no winner.</Heading>
      <Flex>
        <Text ml="2em" fontSize="2xl">{state.message}</Text>
      </Flex>
      <Button size="xl" alignSelf="end" variant="link" onClick={() => state.markCompleted()}><ArrowForwardIcon boxSize={10} /></Button>
    </>
  );
};
export default NoWinnerReveal;
