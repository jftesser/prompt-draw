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

type Started = {
  players: Player[];
  admin: string;
};

const playerForUid = (uid: string): Player => {
  // TODO get display name
  return { uid, name: uid };
};

// TODO - error handling
const useStateFromDatabase = (
  gameId: string | undefined
): ResolvedState | DBError | undefined => {
  const [lobbyPlayers, setLobbyPlayers] = useState<
    undefined | Player[] | string
  >(undefined);
  const [started, setStarted] = useState<undefined | Started | string>(
    undefined
  );

  useEffect(() => {
    if (!gameId) {
      return;
    }

    onValue(ref(database, `lobby/${gameId}`), (snapshot) => {
      const players: Player[] = [];
      snapshot.forEach((child) => {
        const uid = child.val().uid;
        players.push(playerForUid(uid));
      });
      setLobbyPlayers(players);
    });

    onValue(ref(database, `started/${gameId}`), (snapshot) => {
      const admin = snapshot.child("admin").val();
      if (!admin) {
        setStarted("Database error!");
        return;
      }
      if (typeof admin !== "string") {
        setStarted("Database error!");
        return;
      }
      const playersRef = snapshot.child("players");
      const playersVal = playersRef.val();
      if (typeof playersVal !== "object") {
        setStarted("Database error!");
        return;
      }
      if (Array.isArray(playersVal)) {
        setStarted("Database error!");
        return;
      }
      const players = Object.keys(playersVal).map((uid) => playerForUid(uid));
      setStarted({ admin, players });
    });

    return () => {
      setLobbyPlayers(undefined);
    };
  }, [gameId]);

  if (!gameId) {
    return undefined;
  }

  if (typeof started === "string") {
    return { status: "error", error: started };
  }
  if (started !== undefined) {
    return {
      status: "state",
      state: {
        stage: "intro",
        players: started.players,
        gameId,
        admin: started.admin,
      },
    };
  }

  if (typeof lobbyPlayers === "string") {
    return { status: "error", error: lobbyPlayers };
  }
  if (lobbyPlayers !== undefined) {
    return {
      status: "state",
      state: { stage: "lobby", players: lobbyPlayers, gameId },
    };
  }
  return undefined;
};

export default useStateFromDatabase;
