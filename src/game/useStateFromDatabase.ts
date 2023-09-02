import { useCallback, useEffect, useState } from "react";
import { Metaprompt, Player, State, WinnerData } from "./State";
import { off, onValue, ref, set } from "firebase/database";
import { database } from "../firebase/firebaseSetup";
import * as t from "io-ts";
import { match } from "fp-ts/Either";

const LobbyCodec = t.record(t.string, t.type({ uid: t.string }));

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
    undefined | { [uid: string]: string } | string
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
  useEffect(() => {
    if (!gameId) {
      return;
    }

    for (const { path, setter, codec } of [
      {
        path: "lobby",
        setter: mappedSetter(
          setLobbyPlayers,
          (xs: t.TypeOf<typeof LobbyCodec>) =>
            Object.values(xs).map(({ uid }) => playerForUid(uid))
        ),
        codec: LobbyCodec,
      },
      {
        path: "started",
        setter: mappedSetter(setStarted, (x: t.TypeOf<typeof StartedCodec>) => {
          const { admin, players } = x;
          return {
            admin,
            players: players.map((uid: string) => playerForUid(uid)),
          };
        }),
        codec: StartedCodec,
      },
      { path: "metaprompt", setter: setMetaprompt, codec: MetapromptCodec },
      { path: "prompts", setter: setPrompts, codec: UIDToStringCodec },
      { path: "images", setter: setImages, codec: UIDToStringCodec },
      { path: "judgements", setter: setJudgements, codec: UIDToStringCodec },
      { path: "winner", setter: setWinner, codec: WinnerCodec },
      { path: "completed", setter: setCompleted, codec: t.boolean },
    ]) {
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
    if (completed !== undefined && winner !== undefined) {
      return {
        status: "state",
        state: {
          ...common,
          stage: "completed",
          winner: playerForUid(winner.uid),
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
          addImage: async (uid: string, url: string) => {
            await set(ref(database, `games/${gameId}/images/${uid}`), url);
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
