import { FC, useEffect, useState } from "react";
import { IntroState, Metaprompt } from "../game/State";
import { stepOne } from "../gpt";
import { Spinner, Text, Flex, Heading, Button, Divider } from "@chakra-ui/react";
import { ArrowForwardIcon } from '@chakra-ui/icons';
import Speak from "../Speak";

const Intro: FC<{ state: IntroState }> = ({ state }) => {
  const [metaprompt, setMetaprompt] = useState<Metaprompt | null>(null);
  useEffect(() => {
    const canceled = { current: false };
    (async () => {
      try {
        const metaprompt = await stepOne() as Metaprompt;
        if (canceled.current) return;
        setMetaprompt(metaprompt);
      } catch (error) {
        console.error("handlePrompt error:", error);
        // not sure how we're handling errors, should we try again?
      }
    })();
    return () => {
      canceled.current = true;
    };
  }, []);

  return <Flex direction="column" align="center">
    <div>
      <Text>Prompt Draw</Text>
      <Heading as="h1" fontSize={["4em", "6em", "10em"]} lineHeight="0.8">
        Fashion Frenzy
      </Heading>
    </div>
    <Divider orientation="horizontal" mt="2em" mb="2em" />
    <Speak>
      <div>
        <Text mb="0.5em" fontSize="2xl">You are all up and coming designers competing for a prestigous commission. A celebrity needs a new outfit for their upcoming red carpet. You'll each describe an avant garde garment that meets your prospective client's brief for their judgement.</Text>
        <Text mb="0.5em" fontSize="2xl">Expect criticism.</Text>
        <Text fontSize="2xl">Fashion is a ruthless business.</Text>
      </div>
    </Speak>
    {metaprompt ? <Button size="xl" alignSelf="end" variant="link" onClick={() => state.moveToMetaprompt(metaprompt)}><ArrowForwardIcon boxSize={10} /></Button> : <Spinner size="xl" mb="1em" />}
  </Flex>;
};
export default Intro;
