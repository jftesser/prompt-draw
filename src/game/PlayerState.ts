import { Metaprompt, Player } from "./State";

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
  metaprompt: Metaprompt;
  //   addPrompt: (prompt: string) => Promise<void>; TODO
};

export type CompletedState = CommonState & {
    stage: "completed";
    winner: Player;
    //   addPrompt: (prompt: string) => Promise<void>; TODO
  };
  

export type PlayerState = LobbyState | IntroState | MetapromptState | CompletedState;
