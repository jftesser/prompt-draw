import { FC } from "react";
import { JudgingState } from "./ViewState";

const Judging: FC<{ state: JudgingState }> = ({ state }) => {
  return (
    <div>
      <span>{JSON.stringify(state)}</span>
      <img src={state.image} alt="prompt response" />
      <button onClick={() => state.markFinished()}>Confirm</button>
    </div>
  );
};
export default Judging;
