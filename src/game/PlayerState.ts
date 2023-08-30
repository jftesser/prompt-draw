import { Player } from "./State";

export type CommonState = {
  otherPlayers: Player[];
  gameId: string;
};

export type LobbyControls = {
  startGame?: () => Promise<void>;
};

export type LobbyState = CommonState & {
  stage: "lobby";
  controls?: LobbyControls;
};

export type IntroState = CommonState & {
  stage: "intro";
};

export type MetapromptState = CommonState & {
  stage: "metaprompt";
  metaprompt: string;
};

export type PlayerState = LobbyState | IntroState | MetapromptState;
