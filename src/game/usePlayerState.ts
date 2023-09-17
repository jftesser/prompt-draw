import {
  LobbyState as LobbyPlayerState,
  IntroState as IntroPlayerState,
  GetPromptState,
  WaitingForOthersState,
  EndgameState,
  CompletedState as CompletedPlayerState,
  PlayerState,
} from "./PlayerState";
import {
  LobbyState,
  IntroState,
  Player,
  State,
  MainGameState,
  CompletedState,
} from "./State";
import useStateFromDatabase from "../firebase/useStateFromDatabase";
import { unreachable } from "../Utils";

type ResolvedSpecificState<State> = {
  status: "state";
  state: State;
};

export type ResolvedState = {
  status: "state";
  state: PlayerState;
};

export type PlayerError = {
  status: "error";
  error: string;
};

const getOtherPlayers = (
  players: Player[],
  uid: string
): Player[] | undefined => {
  const otherPlayers = players.filter((player) => player.uid !== uid);
  if (otherPlayers.length !== players.length - 1) {
    return undefined;
  }
  return otherPlayers;
};

const getSelf = (
  players: Player[],
  uid: string
): Player | undefined => {
  const selves = players.filter((player) => player.uid === uid);
  if (selves.length < 1) {
    return undefined;
  }
  return selves[0];
};

export const playerLobbyFromLobby = (
  state: LobbyState,
  uid: string
): ResolvedSpecificState<LobbyPlayerState> | PlayerError => {
  const otherPlayers = getOtherPlayers(state.players, uid);
  if (otherPlayers === undefined) {
    return { status: "error", error: "Player not found" };
  }
  const self = getSelf(state.players, uid);
  if (self === undefined) {
    return { status: "error", error: "Self not found" };
  }
  if (state.players[0]?.uid === uid) {
    const controls = otherPlayers.length
      ? {
          startGame: state.startGame,
        }
      : {};
    return {
      status: "state",
      state: {
        stage: "lobby",
        self,
        otherPlayers,
        gameId: state.gameId,
        controls,
      },
    };
  } else {
    return {
      status: "state",
      state: { stage: "lobby", self, otherPlayers, gameId: state.gameId },
    };
  }
};

const playerIntroFromIntro = (
  state: IntroState,
  uid: string
): ResolvedSpecificState<IntroPlayerState> | PlayerError => {
  const otherPlayers = getOtherPlayers(state.players, uid);
  if (otherPlayers === undefined) {
    return { status: "error", error: "Player not found" };
  }
  const self = getSelf(state.players, uid);
  if (self === undefined) {
    return { status: "error", error: "Self not found" };
  }
  return {
    status: "state",
    state: { stage: "intro", self, otherPlayers, gameId: state.gameId },
  };
};

const getPlayerStateFromMainGameState = (
  state: MainGameState,
  uid: string
):
  | ResolvedSpecificState<GetPromptState | WaitingForOthersState | EndgameState>
  | PlayerError => {
  const otherPlayers = getOtherPlayers(state.players, uid);
  if (otherPlayers === undefined) {
    return { status: "error", error: "Player not found" };
  }
  const self = getSelf(state.players, uid);
  if (self === undefined) {
    return { status: "error", error: "Self not found" };
  }
  const common = { self, otherPlayers, gameId: state.gameId };
  if (Object.hasOwn(state.prompts, uid)) {
    return otherPlayers.every((player) =>
      Object.hasOwn(state.prompts, player.uid)
    )
      ? {
          status: "state",
          state: {
            ...common,
            stage: "endgame",
          },
        }
      : {
          status: "state",
          state: {
            ...common,
            stage: "waitingForOthers",
          },
        };
  }
  return {
    status: "state",
    state: {
      ...common,
      stage: "getPrompt",
      metaprompt: state.metaprompt,
      getPrompt: async (prompt: string) => {
        await state.addPrompt(uid, prompt);
      },
    },
  };
};

const playerCompletedFromCompleted = (
  state: CompletedState,
  uid: string
): ResolvedSpecificState<CompletedPlayerState> | PlayerError => {
  const otherPlayers = getOtherPlayers(state.players, uid);
  if (otherPlayers === undefined) {
    return { status: "error", error: "Player not found" };
  }
  const self = getSelf(state.players, uid);
  if (self === undefined) {
    return { status: "error", error: "Self not found" };
  }

  if (state.players[0]?.uid === uid) {
    const controls = otherPlayers.length
      ? {
          restartGame: state.restartGame,
        }
      : {};
    return {
      status: "state",
      state: {
        stage: "completed",
        self,
        otherPlayers,
        gameId: state.gameId,
        winner: state.winner,
        controls
      },
    };
  } else {
    return {
      status: "state",
      state: {
        stage: "completed",
        self,
        otherPlayers,
        gameId: state.gameId,
        winner: state.winner,
      },
    };
  }
};

export const playerStateFromGameState = (
  state: State,
  uid: string
): ResolvedState | PlayerError => {
  if (state.stage === "lobby") {
    return playerLobbyFromLobby(state, uid);
  }
  if (state.stage === "intro") {
    return playerIntroFromIntro(state, uid);
  }
  if (state.stage === "main") {
    return getPlayerStateFromMainGameState(state, uid);
  }
  if (state.stage === "completed") {
    return playerCompletedFromCompleted(state, uid);
  }

  return unreachable(state);
};

export const usePlayerState = (
  gameId: string | undefined,
  uid: string | undefined
): ResolvedState | PlayerError | undefined => {
  const state = useStateFromDatabase(gameId);
  if (!state) {
    return undefined;
  }
  if (state.status === "error") {
    return state;
  }
  if (!uid) {
    return undefined;
  }

  return playerStateFromGameState(state.state, uid);
};

export default usePlayerState;
