import { useCallback, useEffect, useState } from "react";
import { Metaprompt, Player, State, WinnerData } from "./State";
import { off, onValue, ref, set } from "firebase/database";
import { database } from "../firebase/firebaseSetup";
import * as t from "io-ts";
import { match } from "fp-ts/Either";

const StartedCodec = t.type({
  admin: t.string,
  players: t.array(t.string),
});

const MetapromptCodec = t.type({
  metaprompt: t.string,
  celebrity: t.string,
});

const WinnerCodec = t.type({
  uid: t.string,
  message: t.string,
});

export type ResolvedState = {
  status: "state";
  state: State;
};

export type DBError = {
  status: "error";
  error: string;
};

const UIDToStringCodec = t.record(t.string, t.string);

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
  await set(ref(database, `games/${gameId}/started`), {
    admin,
    players: players.map((player) => player.uid),
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
      if (!Array.isArray(playersVal)) {
        setStarted("Database error!");
        return;
      }
      const players = playersVal.map((uid) => playerForUid(uid));
      setStarted({ admin, players });
    });

    for (const { path, setter, codec } of [
      {
        path: "started",
        setter: (v: t.TypeOf<typeof StartedCodec> | string | undefined) => {
          if (typeof v === "object") {
            const { admin, players } = v;
            setStarted({
              admin,
              players: players.map((uid: string) => playerForUid(uid)),
            });
            return;
          }
          setStarted(v);
        },
        codec: StartedCodec,
      },
      { path: "metaprompt", setter: setMetaprompt, codec: MetapromptCodec },
      { path: "prompts", setter: setPrompts, codec: UIDToStringCodec },
      { path: "images", setter: setImages, codec: UIDToStringCodec },
      { path: "judgements", setter: setJudgements, codec: UIDToStringCodec },
      { path: "winner", setter: setWinner, codec: WinnerCodec },
    ]) {
      onValue(ref(database, `games/${gameId}/${path}`), (snapshot) => {
        if (!snapshot.exists()) {
          setter(undefined);
          return;
        }
        match(
          () => {
            setter("Database error!");
          },
          (v) => {
            setter(v as any);
          }
        )(codec.decode(snapshot.val()));
      });
    }

    return () => {
      for (const path of [
        "lobby",
        "started",
        "metaprompt",
        "prompts",
        "images",
        "judgements",
        "winner",
      ]) {
        off(ref(database, `games/${gameId}/${path}`));
      }
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
    console.warn(started, metaprompt, prompts, images, judgements, winner);
    if (metaprompt !== undefined) {
      return {
        status: "state",
        state: {
          ...common,
          stage: "metaprompt",
          metaprompt: metaprompt,
          prompts: prompts ?? {},
          images: images ?? {},
          judgements: judgements ?? {},
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
