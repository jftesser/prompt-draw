import { useEffect, useState } from "react";
import { Player, State } from "./State";
import {
  off,
  onChildAdded,
  onChildRemoved,
  onValue,
  ref,
} from "firebase/database";
import { database } from "../firebase/firebaseSetup";

export type ResolvedState = {
  status: "state";
  state: State;
};

export type DBError = {
  status: "error";
  error: string;
};

const useStateFromDatabase = (
  gameId: string | undefined
): ResolvedState | DBError | undefined => {
  const [state, setState] = useState<ResolvedState | DBError | undefined>(
    undefined
  );

  useEffect(() => {
    if (!gameId) {
      return;
    }

    setState({
      status: "state",
      state: { stage: "lobby", players: [], gameId },
    });
    const playersRef = ref(database, `lobby/${gameId}`);
    onValue(playersRef, (snapshot) => {
      const players: Player[] = [];
      snapshot.forEach((child) => {
        const uid = child.val().uid;
        players.push({ uid, name: uid });
      });
      setState({
        status: "state",
        state: { stage: "lobby", players, gameId },
      });
    });
  }, [gameId]);
  return state;
};

export default useStateFromDatabase;
