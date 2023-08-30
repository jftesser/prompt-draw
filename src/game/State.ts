export type Player = {
  name: string;
  uid: string;
};

export type CommonState = {
  gameId: string;
  players: Player[];
};

export type LobbyState = CommonState & {
  stage: "lobby";
  startGame: () => Promise<void>;
};

export type CommonStartedState = CommonState & {
  admin: string;
};

export type Metaprompt = {
  metaprompt: string;
  celebrity: string;
};

export type IntroState = CommonStartedState & {
  stage: "intro";
  moveToMetaprompt: (metaprompt: Metaprompt) => Promise<void>;
};

export type WinnerData = {
  uid: string;
  message: string;
};

export type MainGameState = CommonStartedState & {
  stage: "main";
  metaprompt: Metaprompt;
  prompts: { [uid: string]: string };
  images: { [uid: string]: string };
  judgements: { [uid: string]: string };
  winner?: WinnerData;
  addPrompt: (uid: string, prompt: string) => Promise<void>;
  addImage: (uid: string, url: string) => Promise<void>;
  addJudgement: (uid: string, judgement: string) => Promise<void>;
  addWinner: (data: WinnerData) => Promise<void>;
  markCompleted: () => Promise<void>;
};

export type CompletedState = CommonStartedState & {
  winner: string;
};

export type State = LobbyState | IntroState | MainGameState;
