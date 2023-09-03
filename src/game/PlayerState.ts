import { Metaprompt, Player } from "./State";

export type CommonState = {
  otherPlayers: Player[];
  gameId: string;
  uid: string;
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

export type GetPromptState = CommonState & {
  stage: "getPrompt";
  metaprompt: Metaprompt;
  getPrompt: (prompt: string) => Promise<void>;
};

export type WaitingForOthersState = CommonState & {
  stage: "waitingForOthers";
};

export type EndgameState = CommonState & {
  stage: "endgame";
};

export type CompletedState = CommonState & {
  stage: "completed";
  winner: Player;
};

export type PlayerState =
  | LobbyState
  | IntroState
  | GetPromptState
  | WaitingForOthersState
  | EndgameState
  | CompletedState;
