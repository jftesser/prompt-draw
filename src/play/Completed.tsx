import { FC } from "react";
import { CompletedState } from "../game/PlayerState";

const Completed: FC<{ state: CompletedState }> = ({ state }) => {
  return <div>{JSON.stringify(state)}</div>;
};
export default Completed;
