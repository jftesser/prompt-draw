import { FC } from "react";
import { WinnerRevealState } from "./ViewState";
import { Button, Image, Flex, Text, Heading } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';

const WinnerReveal: FC<{ state: WinnerRevealState }> = ({ state }) => {
  return (
    <>
      <Heading size="4xl" mb="0.5em" alignSelf="start">The winner is {state.winner}</Heading>
      <Flex>
        {state.image.status === "image" ?
          <Image src={state.image.url} alt="prompt response" boxSize="512px"/> : <div className="host-maingame-judging-censored">CENSORED</div>}
        <Text ml="2em" fontSize="2xl">{state.message}</Text>
      </Flex>
      <Button size="xl" alignSelf="end" variant="link" onClick={() => state.markCompleted()}><ArrowForwardIcon boxSize={10} /></Button>
    </>
  );
};
export default WinnerReveal;
