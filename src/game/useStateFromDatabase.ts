import { useCallback, useEffect, useState } from "react";
import { Metaprompt, Player, State, WinnerData } from "./State";
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
  await set(ref(database, `games/${gameId}/metaprompt`), metaprompt);
};

const markCompletedInternal = async (gameId: string) => {
  await set(ref(database, `games/${gameId}/completed`), true);
};

const startGameInternal = async (
  gameId: string,
  admin: string,
  players: Player[]
): Promise<void> => {
  await set(ref(database, `started/${gameId}`), {
    admin,
    players: Object.fromEntries(players.map((player) => [player.uid, true])),
  });
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
  const [prompts, setPrompts] = useState<
    undefined | { [uid: string]: string } | string
  >(undefined);
  const [images, setImages] = useState<
    undefined | { [uid: string]: string } | string
  >(undefined);
  const [judgements, setJudgements] = useState<
    undefined | { [uid: string]: string } | string
  >(undefined);
  const [winner, setWinner] = useState<undefined | WinnerData | string>(
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

  const markCompleted = useCallback(async () => {
    if (gameId === undefined) {
      return;
    }
    if (typeof winner === "object") {
      markCompletedInternal(gameId);
    }
  }, [gameId, winner]);

  const startGame = useCallback(async () => {
    if (gameId === undefined) {
      return;
    }
    if (typeof lobbyPlayers !== "object") {
      return;
    }
    await startGameInternal(gameId, lobbyPlayers[0].uid, lobbyPlayers);
  }, [gameId, lobbyPlayers]);
  useEffect(() => {
    if (!gameId) {
      return;
    }

    onValue(ref(database, `games/${gameId}/lobby`), (snapshot) => {
      const players: Player[] = [];
      snapshot.forEach((child) => {
        const uid = child.val().uid;
        players.push(playerForUid(uid));
      });
      setLobbyPlayers(players);
    });

    onValue(ref(database, `games/${gameId}/started`), (snapshot) => {
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

    onValue(ref(database, `games/${gameId}/metaprompt`), (snapshot) => {
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
      off(ref(database, `games/${gameId}/lobby`));
      off(ref(database, `games/${gameId}/started`));
      off(ref(database, `metaprompt/${gameId}/`));
      setLobbyPlayers(undefined);
      setStarted(undefined);
      setMetaprompt(undefined);
      setPrompts(undefined);
      setWinner(undefined);
      setImages(undefined);
      setJudgements(undefined);
    };
  }, [gameId]);

  if (!gameId) {
    return undefined;
  }

  // We can't simplify this because then typescript won't update the variable types :'(
  if (typeof lobbyPlayers === "string") {
    return { status: "error", error: lobbyPlayers };
  }
  if (typeof started === "string") {
    return { status: "error", error: started };
  }
  if (typeof metaprompt === "string") {
    return { status: "error", error: metaprompt };
  }
  if (typeof prompts === "string") {
    return { status: "error", error: prompts };
  }
  if (typeof images === "string") {
    return { status: "error", error: images };
  }
  if (typeof judgements === "string") {
    return { status: "error", error: judgements };
  }
  if (typeof winner === "string") {
    return { status: "error", error: winner };
  }

  if (started !== undefined) {
    const common = { players: started.players, gameId, admin: started.admin };
    if (
      metaprompt !== undefined &&
      prompts !== undefined &&
      judgements !== undefined &&
      images !== undefined
    ) {
      return {
        status: "state",
        state: {
          ...common,
          stage: "metaprompt",
          metaprompt: metaprompt as Metaprompt,
          prompts,
          images,
          judgements,
          markCompleted,
          addPrompt: async () => {
            throw new Error("TODO");
          },
          addImage: async () => {
            throw new Error("TODO");
          },
          addJudgement: async () => {
            throw new Error("TODO");
          },
          addWinner: async () => {
            throw new Error("TODO");
          },
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

  if (lobbyPlayers !== undefined) {
    return {
      status: "state",
      state: { stage: "lobby", players: lobbyPlayers, gameId, startGame },
    };
  }
  return undefined;
};

export default useStateFromDatabase;
