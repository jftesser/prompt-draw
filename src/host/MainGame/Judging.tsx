import { FC } from "react";
import { JudgingState } from "./ViewState";

const Judging: FC<{ state: JudgingState }> = ({ state }) => {
  return <div>{JSON.stringify(state)}</div>;
};
export default Judging;
