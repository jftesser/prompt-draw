import { FC } from "react";
import { WinnerRevealState } from "./ViewState";

const WinnerReveal: FC<{ state: WinnerRevealState }> = ({ state }) => {
  return <div>{JSON.stringify(state)}</div>;
};
export default WinnerReveal;
