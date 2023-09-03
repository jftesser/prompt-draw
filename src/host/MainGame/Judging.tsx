import { FC } from "react";
import { JudgingState } from "./ViewState";
import "./Judging.scss";

const Judging: FC<{ state: JudgingState }> = ({ state }) => {
  return (
    <div>
      <span>{JSON.stringify(state)}</span>
      {state.image.status === "image" ? 
      <img src={state.image.url} alt="prompt response" /> : <div className="host-maingame-judging-censored">CENSORED</div>}
      <button onClick={() => state.markFinished()}>Confirm</button>
    </div>
  );
};
export default Judging;
