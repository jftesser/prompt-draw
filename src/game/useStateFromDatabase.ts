import { useCallback, useEffect, useState } from "react";
import { Player, State } from "./State";
import { off, onValue, ref, set } from "firebase/database";
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

type MetaPrompt = {
  metaprompt: string;
};

const playerForUid = (uid: string): Player => {
  // TODO get display name
  return { uid, name: uid };
};

const moveToMetapromptInternal = async (gameId: string, metaprompt: string) => {
  await set(ref(database, `metaprompt/${gameId}`), { metaprompt });
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
  const [metaprompt, setMetaprompt] = useState<undefined | MetaPrompt | string>(
    undefined
  );

  const moveToMetaprompt = useCallback(
    async (metaprompt: string) => {
      if (gameId === undefined) {
        return;
      }
      await moveToMetapromptInternal(gameId, metaprompt);
    },
    [gameId]
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

    onValue(ref(database, `metaprompt/${gameId}`), (snapshot) => {
      const metaprompt = snapshot.child("metaprompt").val();
      if (typeof metaprompt !== "string") {
        setMetaprompt("Database error!");
        return;
      }
      setMetaprompt({ metaprompt });
    });

    return () => {
      off(ref(database, `lobby/${gameId}`));
      off(ref(database, `started/${gameId}`));
      off(ref(database, `metaprompt/${gameId}`));
      setLobbyPlayers(undefined);
      setStarted(undefined);
      setMetaprompt(undefined);
    };
  }, [gameId]);

  if (!gameId) {
    return undefined;
  }

  if (typeof started === "string") {
    return { status: "error", error: started };
  }
  if (typeof metaprompt === "string") {
    return { status: "error", error: metaprompt };
  }

  if (started !== undefined) {
    const common = { players: started.players, gameId, admin: started.admin };
    if (metaprompt !== undefined) {
      return {
        status: "state",
        state: {
          ...common,
          stage: "metaprompt",
          metaprompt: metaprompt.metaprompt,
        },
      };
    }

    return {
      status: "state",
      state: {
        stage: "intro",
        moveToMetaprompt,
        ...common,
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
