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

export type State = LobbyState;
