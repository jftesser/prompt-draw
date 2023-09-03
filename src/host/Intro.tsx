import { FC, useEffect } from "react";
import { IntroState } from "../game/State";
import { stepOne } from "../gpt";
import { Spinner, Text, Flex } from "@chakra-ui/react";

const Intro: FC<{ state: IntroState }> = ({ state }) => {
  const moveToMetaprompt = state.moveToMetaprompt;
  useEffect(() => {
    const canceled = { current: false };
    (async () => {
      try {
        const metaprompt = await stepOne() as any;
        if (canceled.current) return;
        moveToMetaprompt(metaprompt);
      } catch (error) {
        console.error("handlePrompt error:", error);
        // not sure how we're handling errors, should we try again?
      }
    })();
    return () => {
      canceled.current = true;
    };
  }, [moveToMetaprompt]);
  return <Flex direction="column" align="center">
    <Spinner size="xl" mb="1em" />
    <Text fontSize="2xl">Your new client is contemplating their clothing desires...</Text>
  </Flex>;
};
export default Intro;
