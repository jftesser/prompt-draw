import { FC } from "react";
import { WaitingForOthersState } from "../game/PlayerState";
import { Spinner, Text, Flex } from "@chakra-ui/react";

const WaitingForOtherPlayers: FC<{ state: WaitingForOthersState }> = ({
  state,
}) => {
  return <Flex direction="column" align="center">
    <Spinner mb="1em" />
    <Text>Waiting on your competition...</Text>
  </Flex>;
};
export default WaitingForOtherPlayers;
