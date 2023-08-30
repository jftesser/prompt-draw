import { useCallback, useEffect, useState } from "react";
import { Metaprompt, Player, State } from "./State";
import { off, onValue, ref, set } from "firebase/database";
import { database } from "../firebase/firebaseSetup";
import * as t from "io-ts";
import { match } from "fp-ts/Either";

const MetapromptCodec = t.type({
  metaprompt: t.string,
  celebrity: t.string,
});

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

const moveToMetapromptInternal = async (
  gameId: string,
  metaprompt: Metaprompt
) => {
  console.log("Moving to metaprompt", metaprompt);
  await set(ref(database, `metaprompt/${gameId}`), metaprompt);
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
  const [metaprompt, setMetaprompt] = useState<undefined | Metaprompt | string>(
    undefined
  );

  const moveToMetaprompt = useCallback(
    async (metaprompt: Metaprompt) => {
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
      if (!snapshot.exists()) {
        setStarted(undefined);
        return;
      }
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
      if (!snapshot.exists()) {
        setMetaprompt(undefined);
        return;
      }
      match(
        () => {
          setMetaprompt("Database error!");
        },
        (v: Metaprompt) => {
          setMetaprompt(v);
        }
      )(MetapromptCodec.decode(snapshot.val()));
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
          metaprompt,
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
