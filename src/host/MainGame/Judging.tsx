import { FC } from "react";
import { JudgingState } from "./ViewState";

const Judging: FC<{ state: JudgingState }> = ({ state }) => {
  return (
    <div>
      <span>{JSON.stringify(state)}</span>
      <button onClick={() => state.markFinished()}>Confirm</button>
    </div>
  );
};
export default Judging;
