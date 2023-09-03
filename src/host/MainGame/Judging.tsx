import { FC } from "react";
import { JudgingState } from "./ViewState";
import "./Judging.scss";
import { Button } from '@chakra-ui/react';

const Judging: FC<{ state: JudgingState }> = ({ state }) => {
  return (
    <div>
      <span>{JSON.stringify(state)}</span>
      {state.image.status === "image" ? 
      <img src={state.image.url} alt="prompt response" /> : <div className="host-maingame-judging-censored">CENSORED</div>}
      <Button onClick={() => state.markFinished()}>Confirm</Button>
    </div>
  );
};
export default Judging;
