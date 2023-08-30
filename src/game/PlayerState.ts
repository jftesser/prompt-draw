import { Player } from "./State";

export type CommonState = {
  gameId: string;
};

export type LobbyControls = {
  startGame?: () => Promise<void>;
};

export type LobbyState = CommonState & {
  stage: "lobby";
  otherPlayers: Player[];
  controls?: LobbyControls;
};

export type IntroState = CommonState & {
  stage: "intro";
  otherPlayers: Player[];
};

export type PlayerState = LobbyState | IntroState;
