import { useCallback, useEffect, useState } from "react";
import {
  Metaprompt,
  Player,
  State,
  WinnerData,
  Image,
  PastWinner,
} from "../game/State";
import { get, off, onValue, ref, set } from "firebase/database";
import { database } from "./firebaseSetup";
import { z } from "zod";
import { getPastWinners } from "./getPastWinners";

const PlayerCodec = z.object({ uid: z.string(), name: z.string() });

const LobbyCodec = z.record(z.string(), PlayerCodec);

const StartedCodec = z.object({
  admin: z.string(),
  players: z.array(PlayerCodec),
});

const MetapromptCodec = z.object({
  metaprompt: z.string(),
  celebrity: z.string(),
});

const WinnerCodec = z.object({
  uid: z.string(),
  message: z.string(),
});

export type ResolvedState = {
  status: "state";
  state: State;
};

export type DBError = {
  status: "error";
  error: string;
};

const UIDToStringCodec = z.record(z.string(), z.string());

const UIDToImageCodec = z.record(
  z.string(),
  z.union([
    z.object({ status: z.literal("censored") }),
    z.object({ status: z.literal("image"), url: z.string() }),
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
  const [pastWinners, setPastWinners] = useState<PastWinner[]>([]);
  const [restartCount, setRestartCount] = useState<number>(0);

  useEffect(() => {
    const canceled = { current: false };
    (async () => {
      try {
        const pastWinners = await getPastWinners();
        if (canceled.current) {
          return;
        }
        setPastWinners(pastWinners);
      } catch (error) {
        console.error("getting past winners error:", error);
        setPastWinners([]);
      }
    })();
    return () => {
      canceled.current = true;
    };
  }, []);

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
    setRestartCount(restartCount + 1);
    await restartGameInternal(gameId);
  }, [gameId, restartCount]);

  useEffect(() => {
    if (!gameId) {
      return;
    }

    type CodecData<T, Codec extends z.ZodType<T>> = {
      path: string;
      setter: (x: T | undefined | string) => void;
      codec: Codec;
    };

    const connect = <T, Codec extends z.ZodType<T>>({
      path,
      setter,
      codec,
    }: CodecData<T, Codec>) => {
      onValue(ref(database, `games/${gameId}/${path}`), (snapshot) => {
        if (!snapshot.exists()) {
          setter(undefined);
          return;
        }
        const parsed = codec.safeParse(snapshot.val());
        if (!parsed.success) {
          console.warn("FAILED TO DECODE", path, snapshot.val());
          setter("Database error!");
          return;
        }
        setter(parsed.data);
      });
    };
    connect({
      path: "lobby",
      setter: mappedSetter(setLobbyPlayers, (xs: z.infer<typeof LobbyCodec>) =>
        Object.values(xs)
      ),
      codec: LobbyCodec,
    });
    connect({
      path: "started",
      setter: mappedSetter(setStarted, (x: z.infer<typeof StartedCodec>) => {
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
    connect({ path: "completed", setter: setCompleted, codec: z.boolean() });

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
    const common = {
      players: started.players,
      gameId,
      admin: started.admin,
      pastWinners,
    };
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
    state: {
      stage: "lobby",
      players: lobbyPlayers ?? [],
      gameId,
      startGame,
      pastWinners,
    },
  };
};

export default useStateFromDatabase;
