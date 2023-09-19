import { FC } from "react";
import { WinnerRevealState } from "./ViewState";
import { Button, Flex, Text, Heading } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import ImageDisplay from "../ImageDisplay";
import Speak from "../../Speak";

const WinnerReveal: FC<{ state: WinnerRevealState }> = ({ state }) => {
  return (
    <>
      <Heading fontSize={["4em", "6em"]} lineHeight="0.8" mb="0.5em" alignSelf="start">The winner is {state.winner}</Heading>
      <Flex>
        <ImageDisplay image={state.image} prompt={state.prompt} sz="512px" />
        <Flex width="50%" ml="2em" direction="column">
          <Speak>
            <Text fontSize="2xl">{state.message}</Text>
          </Speak>
        </Flex>
      </Flex>
      <Button size="xl" alignSelf="end" variant="link" onClick={() => state.markCompleted()}><ArrowForwardIcon boxSize={10} /></Button>
    </>
  );
};
export default WinnerReveal;
