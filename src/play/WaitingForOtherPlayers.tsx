import { FC } from "react";
import { WaitingForOthersState } from "../game/PlayerState";

const WaitingForOtherPlayers: FC<{ state: WaitingForOthersState }> = ({
  state,
}) => {
  return <div>{JSON.stringify(state)}</div>;
};
export default WaitingForOtherPlayers;
