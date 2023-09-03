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

  // Metaprompt to show to players
  metaprompt: Metaprompt;

  // Prompts created by each player.  This will be built "on the fly" - user
  // prompts will be added when they come in from the players
  prompts: { [uid: string]: string };

  // Images for each user's prompts.  These will be built "on the fly" - user
  // images will be added when they are created by the host.
  images: { [uid: string]: string };

  // Judgements for each user's prompts
  judgements: { [uid: string]: string };

  // Data about the winner, after that comes in.
  winner: WinnerData | undefined;

  // Called by each player - set their own prompt
  addPrompt: (uid: string, prompt: string) => Promise<void>;

  // Called by the host - set the image for a prompt
  addImage: (uid: string, url: string) => Promise<void>;

  // Called by the host - set the judgement for a prompt
  addJudgement: (uid: string, judgement: string) => Promise<void>;

  // Called by the host - set the winner
  addWinner: (data: WinnerData) => Promise<void>;

  // Called by the host - mark the game as completed
  markCompleted: () => Promise<void>;
};

export type CompletedState = CommonStartedState & {
  stage: "completed";
  winner: Player;
  restartGame: () => Promise<void>;
};

export type State = LobbyState | IntroState | MainGameState | CompletedState;
