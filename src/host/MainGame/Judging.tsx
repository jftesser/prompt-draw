import { FC } from "react";
import { JudgingState } from "./ViewState";
import "./Judging.scss";
import { Button, Flex, Text, Heading } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import ImageDisplay from "../ImageDisplay";

const Judging: FC<{ state: JudgingState }> = ({ state }) => {
  return (
    <>
      <Heading fontSize={["4em", "6em"]} lineHeight="0.8" mb="0.5em" alignSelf="start">{state.player}'s design</Heading>
      <Flex>
        <ImageDisplay image={state.image} prompt={state.prompt} sz="512px" />
        <Text width="50%" ml="2em" fontSize="2xl">{state.judgement}</Text>
      </Flex>
      <Button size="xl" alignSelf="end" variant="link" onClick={() => state.markFinished()}><ArrowForwardIcon boxSize={10} /></Button>
    </>
  );
};
export default Judging;
