import { PlayerState } from "./PlayerState";
import { State } from "./State";
import useStateFromDatabase from "./useStateFromDatabase";

export type ResolvedState = {
  status: "state";
  state: PlayerState;
};

export type PlayerError = {
  status: "error";
  error: string;
};

export const playerStateFromGameState = (
  state: State,
  uid: string
): ResolvedState | PlayerError => {
  const otherPlayers = state.players.filter((player) => player.uid !== uid);
  if (otherPlayers.length !== state.players.length - 1) {
    return { status: "error", error: "Player not found" };
  }
  if (state.players[0]?.uid === uid) {
    return {
      status: "state",
      state: {
        stage: "lobby",
        otherPlayers,
        gameId: state.gameId,
        controls: {},
      },
    };
  } else {
    return {
      status: "state",
      state: { stage: "lobby", otherPlayers, gameId: state.gameId },
    };
  }
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