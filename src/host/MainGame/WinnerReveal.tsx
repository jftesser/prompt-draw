import { FC } from "react";
import { WinnerRevealState } from "./ViewState";

const WinnerReveal: FC<{ state: WinnerRevealState }> = ({ state }) => {
  return (
    <div>
      <span>{JSON.stringify(state)}</span>
      <button onClick={() => state.markCompleted()}>Confirm</button>
    </div>
  );
};
export default WinnerReveal;
