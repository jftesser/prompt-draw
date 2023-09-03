import { FC } from "react";
import { JudgingState } from "./ViewState";
import "./Judging.scss";
import { Button, Image, Flex, Text, Heading } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';

const Judging: FC<{ state: JudgingState }> = ({ state }) => {
  return (
    <>
      <Heading size="4xl" mb="0.5em" alignSelf="start">{state.player}'s design</Heading>
      <Flex>
        {state.image.status === "image" ?
          <Image src={state.image.url} alt="prompt response" /> : <div className="host-maingame-judging-censored">CENSORED</div>}
        <Text ml="2em" fontSize="2xl">{state.judgement}</Text>
      </Flex>
      <Button size="xl" alignSelf="end" variant="link" onClick={() => state.markFinished()}><ArrowForwardIcon boxSize={10} /></Button>
    </>
  );
};
export default Judging;
