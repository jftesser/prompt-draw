import { useCallback, useEffect, useState } from "react";
import { Metaprompt, Player, State, WinnerData, Image } from "./State";
import { get, off, onValue, ref, set } from "firebase/database";
import { database } from "../firebase/firebaseSetup";
import * as t from "io-ts";
import { match } from "fp-ts/Either";

const PlayerCodec = t.type({ uid: t.string, name: t.string });

const LobbyCodec = t.record(t.string, PlayerCodec);

const StartedCodec = t.type({
  admin: t.string,
  players: t.array(PlayerCodec),
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

const UIDToImageCodec = t.record(
  t.string,
  t.union([
    t.type({ status: t.literal("censored") }),
    t.type({ status: t.literal("image"), url: t.string }),
  ])
);

type Started = {
  players: Player[];
  admin: string;
};

const moveToMetapromptInternal = async (
  gameId: string,
  metaprompt: Metaprompt
) => {
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
  // list of snarky adjectives to add to player names to make them unique
  const adjectives = [
    "the Great",
    "the Magnificent",
    "the Terrible",
    "the Unstoppable",
    "the Unbeatable",
    "the Unbelievable",
    "the Moderate",
    "the Mediocre",
    "the Average",
  ];

  players.forEach((player) => {
    if (players.filter((p) => p.name === player.name).length > 1) {
      const adjective =
        adjectives[Math.floor(Math.random() * adjectives.length)];
      player.name = `${player.name} ${adjective}`;
    }
  });

  await set(ref(database, `games/${gameId}/started`), {
    admin,
    players,
  });
};

const restartGameInternal = async (gameId: string) => {
  console.log("RESTARTING");
  // pulling values directly from the db as they have keys that aren't captured locally
  const hostSnap = await get(ref(database, `games/${gameId}/host`));
  if (!hostSnap.exists()) return;

  const host = hostSnap.val();

  const lobbySnap = await get(ref(database, `games/${gameId}/lobby`));
  if (!lobbySnap.exists()) return;

  const lobby = lobbySnap.val();

  const startedSnap = await get(ref(database, `games/${gameId}/started`));
  if (!startedSnap.exists()) return;

  const started = startedSnap.val();

  await set(ref(database, `games/${gameId}`), {
    completed: false,
    host,
    lobby,
    started,
  });
};

const mappedSetter =
  <T, U extends object>(
    setter: (setter: T | undefined | string) => void,
    f: (x: U) => T
  ): ((x: U | undefined | string) => void) =>
  (v) => {
    if (typeof v === "object") {
      setter(f(v));
      return;
    }
    setter(v);
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
    undefined | { [uid: string]: Image } | string
  >(undefined);
  const [judgements, setJudgements] = useState<
    undefined | { [uid: string]: string } | string
  >(undefined);
  const [winner, setWinner] = useState<undefined | WinnerData | string>(
    undefined
  );
  const [completed, setCompleted] = useState<undefined | boolean | string>(
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

  const restartGame = useCallback(async () => {
    if (gameId === undefined) {
      return;
    }
    await restartGameInternal(gameId);
  }, [gameId]);

  useEffect(() => {
    if (!gameId) {
      return;
    }

    type CodecData<T> = {
      path: string;
      setter: (x: T | undefined | string) => void;
      codec: t.Type<T, unknown>;
    };

    const connect = <T>({ path, setter, codec }: CodecData<T>) => {
      onValue(ref(database, `games/${gameId}/${path}`), (snapshot) => {
        if (!snapshot.exists()) {
          setter(undefined);
          return;
        }
        match(
          () => {
            console.warn("FAILED TO DECODE", path, snapshot.val());
            setter("Database error!");
          },
          (v) => {
            setter(v as any);
          }
        )(codec.decode(snapshot.val()));
      });
    };
    connect({
      path: "lobby",
      setter: mappedSetter(setLobbyPlayers, (xs: t.TypeOf<typeof LobbyCodec>) =>
        Object.values(xs)
      ),
      codec: LobbyCodec,
    });
    connect({
      path: "started",
      setter: mappedSetter(setStarted, (x: t.TypeOf<typeof StartedCodec>) => {
        const { admin, players } = x;
        return {
          admin,
          players,
        };
      }),
      codec: StartedCodec,
    });
    connect({
      path: "metaprompt",
      setter: setMetaprompt,
      codec: MetapromptCodec,
    });
    connect({ path: "prompts", setter: setPrompts, codec: UIDToStringCodec });
    connect({ path: "images", setter: setImages, codec: UIDToImageCodec });
    connect({
      path: "judgements",
      setter: setJudgements,
      codec: UIDToStringCodec,
    });
    connect({ path: "winner", setter: setWinner, codec: WinnerCodec });
    connect({ path: "completed", setter: setCompleted, codec: t.boolean });

    return () => {
      for (const path of [
        "lobby",
        "started",
        "metaprompt",
        "prompts",
        "images",
        "judgements",
        "winner",
        "completed",
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
  if (typeof completed === "string") {
    return { status: "error", error: completed };
  }

  if (started !== undefined) {
    const common = { players: started.players, gameId, admin: started.admin };
    if (completed && winner !== undefined) {
      const winnerPlayer = started.players.find(
        (player) => player.uid === winner.uid
      );
      if (!winnerPlayer) {
        return { status: "error", error: "Invalid winner" };
      }
      return {
        status: "state",
        state: {
          ...common,
          stage: "completed",
          winner: winnerPlayer,
          prompts: prompts ?? {},
          images: images ?? {},
          restartGame,
        },
      };
    }

    if (metaprompt !== undefined) {
      return {
        status: "state",
        state: {
          ...common,
          stage: "main",
          metaprompt: metaprompt,
          prompts: prompts ?? {},
          images: images ?? {},
          judgements: judgements ?? {},
          winner,
          markCompleted,
          addPrompt: async (uid: string, prompt: string) => {
            await set(ref(database, `games/${gameId}/prompts/${uid}`), prompt);
          },
          addImage: async (uid: string, image: Image) => {
            await set(ref(database, `games/${gameId}/images/${uid}`), image);
          },
          addJudgement: async (uid: string, message: string) => {
            await set(
              ref(database, `games/${gameId}/judgements/${uid}`),
              message
            );
          },
          addWinner: async (data: WinnerData) => {
            await set(ref(database, `games/${gameId}/winner`), data);
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

  return {
    status: "state",
    state: { stage: "lobby", players: lobbyPlayers ?? [], gameId, startGame },
  };
};

export default useStateFromDatabase;
