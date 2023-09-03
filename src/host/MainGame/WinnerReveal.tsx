import { FC } from "react";
import { WinnerRevealState } from "./ViewState";
import { Button } from '@chakra-ui/react';

const WinnerReveal: FC<{ state: WinnerRevealState }> = ({ state }) => {
  return (
    <div>
      <span>{JSON.stringify(state)}</span>
      <Button onClick={() => state.markCompleted()}>Confirm</Button>
    </div>
  );
};
export default WinnerReveal;
