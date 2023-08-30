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

export type Metaprompt = {
  metaprompt: string;
  celebrity: string;
};

export type IntroState = CommonStartedState & {
  stage: "intro";
  moveToMetaprompt: (metaprompt: Metaprompt) => Promise<void>;
};

export type MetapromptState = CommonStartedState & {
  stage: "metaprompt";
  metaprompt: Metaprompt;
};

export type State = LobbyState | IntroState | MetapromptState;
