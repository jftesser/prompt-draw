import { FC } from "react";
import { LobbyState } from "../game/State";

const Lobby: FC<{ state: LobbyState }> = ({ state }) => {
  return <div>{JSON.stringify(state)}</div>;
};
export default Lobby;
