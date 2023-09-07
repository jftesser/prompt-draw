import { FC } from "react";
import { WinnerRevealState } from "./ViewState";
import { Button, Flex, Text, Heading } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import ImageDisplay from "../ImageDisplay";

const WinnerReveal: FC<{ state: WinnerRevealState }> = ({ state }) => {
  return (
    <>
      <Heading size="4xl" mb="0.5em" alignSelf="start">The winner is {state.winner}</Heading>
      <Flex>
        <ImageDisplay image={state.image} prompt={state.prompt} sz="512px" />
        <Text width="50%" ml="2em" fontSize="2xl">{state.message}</Text>
      </Flex>
      <Button size="xl" alignSelf="end" variant="link" onClick={() => state.markCompleted()}><ArrowForwardIcon boxSize={10} /></Button>
    </>
  );
};
export default WinnerReveal;
