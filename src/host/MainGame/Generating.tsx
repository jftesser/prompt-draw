import { FC } from "react";
import { GeneratingState } from "./ViewState";

const Generating: FC<{ state: GeneratingState }> = ({ state }) => {
  return <div>{JSON.stringify(state)}</div>;
};
export default Generating;
