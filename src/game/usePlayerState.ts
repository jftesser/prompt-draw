import { ref, set } from "firebase/database";
import {
  LobbyState as LobbyPlayerState,
  IntroState as IntroPlayerState,
  MetapromptState as MetapromptPlayerState,
  PlayerState,
} from "./PlayerState";
import {
  LobbyState,
  IntroState,
  Player,
  State,
  MetapromptState,
} from "./State";
import useStateFromDatabase from "./useStateFromDatabase";
import { database } from "../firebase/firebaseSetup";
import { unreachable } from "../Utils";

type ResolvedLobbyState = {
  status: "state";
  state: LobbyPlayerState;
};

type ResolvedIntroState = {
  status: "state";
  state: IntroPlayerState;
};

type ResolvedMetapromptState = {
  status: "state";
  state: MetapromptPlayerState;
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

export const playerLobbyFromLobby = (
  state: LobbyState,
  uid: string
): ResolvedLobbyState | PlayerError => {
  const otherPlayers = getOtherPlayers(state.players, uid);
  if (otherPlayers === undefined) {
    return { status: "error", error: "Player not found" };
  }
  if (state.players[0]?.uid === uid) {
    const controls = otherPlayers
      ? {
          startGame: state.startGame,
        }
      : {};
    return {
      status: "state",
      state: {
        stage: "lobby",
        otherPlayers,
        gameId: state.gameId,
        controls,
      },
    };
  } else {
    return {
      status: "state",
      state: { stage: "lobby", otherPlayers, gameId: state.gameId },
    };
  }
};

const playerIntroFromIntro = (
  state: IntroState,
  uid: string
): ResolvedIntroState | PlayerError => {
  const otherPlayers = getOtherPlayers(state.players, uid);
  if (otherPlayers === undefined) {
    return { status: "error", error: "Player not found" };
  }
  return {
    status: "state",
    state: { stage: "intro", otherPlayers, gameId: state.gameId },
  };
};

const playerMetapromptFromMetaprompt = (
  state: MetapromptState,
  uid: string
): ResolvedMetapromptState | PlayerError => {
  const otherPlayers = getOtherPlayers(state.players, uid);
  if (otherPlayers === undefined) {
    return { status: "error", error: "Player not found" };
  }
  return {
    status: "state",
    state: {
      stage: "metaprompt",
      otherPlayers,
      gameId: state.gameId,
      metaprompt: state.metaprompt,
    },
  };
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
  if (state.stage === "metaprompt") {
    return playerMetapromptFromMetaprompt(state, uid);
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
