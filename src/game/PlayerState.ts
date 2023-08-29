import { Player } from "./State";

export type CommonState = {
  gameId: string;
};

export type LobbyControls = {
  startGame?: () => void;
};

export type LobbyState = CommonState & {
  stage: "lobby";
  otherPlayers: Player[];
  controls?: LobbyControls;
};

export type PlayerState = LobbyState;
