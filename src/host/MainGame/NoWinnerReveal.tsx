import { FC } from "react";
import { NoWinnerRevealState } from "./ViewState";
import { Button, Text, Heading } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import Speak from "../../Speak";

const NoWinnerReveal: FC<{ state: NoWinnerRevealState }> = ({ state }) => {
  return (
    <>
      <Heading fontSize={["4em", "6em"]} lineHeight="0.8" mb="0.5em" alignSelf="start">I am disappointed. There is no winner.</Heading>
      <Speak>
        <Text ml="2em" fontSize="2xl">{state.message}</Text>
      </Speak>
      <Button size="xl" alignSelf="end" variant="link" onClick={() => state.markCompleted()}><ArrowForwardIcon boxSize={10} /></Button>
    </>
  );
};
export default NoWinnerReveal;
