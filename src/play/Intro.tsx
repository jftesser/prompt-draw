import { FC } from "react";
import { IntroState } from "../game/PlayerState";
import { Spinner, Text, Flex } from "@chakra-ui/react";

const Intro: FC<{ state: IntroState }> = ({ state }) => {
  return <Flex direction="column" align="center">
    <Spinner size="xl" mb="1em"/>
    <Text fontSize="2xl">Your new client is contemplating their clothing desires...</Text>
  </Flex>;
};
export default Intro;
