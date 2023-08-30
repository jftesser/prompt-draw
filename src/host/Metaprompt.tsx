import { FC } from "react";
import { MetapromptState } from "../game/State";

const Metaprompt: FC<{ state: MetapromptState }> = ({ state }) => {
  return <div>{JSON.stringify(state)}</div>;
};
export default Metaprompt;