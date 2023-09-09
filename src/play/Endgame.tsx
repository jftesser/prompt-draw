import { FC } from "react";
import { EndgameState } from "../game/PlayerState";
import { Text } from "@chakra-ui/react";

const Endgame: FC<{ state: EndgameState }> = ({ state }) => {
  return <Text fontSize={["4em", "6em", "10em"]}>Judging in progress.</Text>;
};
export default Endgame;
