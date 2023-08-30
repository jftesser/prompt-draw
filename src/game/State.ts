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
};

export type CommonStartedState = CommonState & {
  admin: string;
};

export type IntroState = CommonStartedState & {
  stage: "intro";
};

export type MetaPrompt = CommonStartedState & {
  stage: "metaprompt";
  metaprompt: string;
};

export type State = LobbyState | IntroState | MetaPrompt;
