import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MainGameState } from "../../game/State";
import Display from "./Display";
import createViewState from "./createViewState";
import { getImageURL, stepTwo, stepThree } from "../../gpt";
import update from "immutability-helper";

const MainGame: FC<{ state: MainGameState }> = ({ state }) => {
  const [displayedJudgements, setDisplayedJudgement] = useState<{
    [uid: string]: string;
  }>({});
  const imageCancelers = useRef<{
    [uid: string]: { prompt: string; celebrity: string; cancel: () => void };
  }>({});

  console.warn("MAIN GAME", state);

  const {
    winner,
    images,
    addImage,
    prompts,
    players,
    judgements,
    addJudgement,
    addWinner,
    metaprompt: { celebrity, metaprompt },
  } = state;

  const getPlayerNameFromUID = useCallback(
    (uid: string) => {
      const player = players.find((player) => player.uid === uid);
      if (!player) return "Unknown Player";
      return player.name;
    },
    [players]
  );

  const UIDFromName = useCallback(
    (name: string) => {
      const player = players.find((player) => player.name === name);
      if (!player) return "undefined";
      return player.uid;
    },
    [players]
  );

  const swapUIDForName = useCallback(
    (obj: { [uid: string]: any }) => {
      const newObj: { [name: string]: any } = {};
      for (const [uid, value] of Object.entries(obj)) {
        newObj[getPlayerNameFromUID(uid)] = value;
      }
      return newObj;
    },
    [getPlayerNameFromUID]
  );

  // Clear out any displayed prompts which are no longer valid.
  useEffect(() => {
    // First, remove any displayed judgements that are no longer valid
    const deleted: string[] = [];
    for (const [uid, judgement] of Object.entries(displayedJudgements)) {
      const originalJudgement = judgements[uid];
      if (!originalJudgement || originalJudgement !== judgement) {
        deleted.push(uid);
      }
      if (deleted.length) {
        setDisplayedJudgement((prev) => {
          const newDisplayed = update(prev, { $unset: deleted });
          console.warn("DELETING DISPLAYED", newDisplayed);
          return newDisplayed;
        });
      }
    }
  }, [displayedJudgements, judgements]);

  useEffect(() => {
    // Cancel any images that don't match the current prompt
    for (const [
      uid,
      { prompt, celebrity: celebrity_, cancel },
    ] of Object.entries(imageCancelers.current)) {
      if (prompt !== prompts[uid] || celebrity !== celebrity_) {
        cancel();
        delete imageCancelers.current[uid];
      }
    }

    // Get images for any new prompts
    for (const [uid, prompt] of Object.entries(prompts)) {
      if (
        !Object.hasOwn(images, uid) &&
        !Object.hasOwn(imageCancelers.current, uid)
      ) {
        const canceled = { current: false };
        (async () => {
          try {
            const image = await getImageURL(prompt, celebrity);
            if (canceled.current) {
              return;
            }
            delete imageCancelers.current[uid];
            await addImage(uid, image);
          } catch (error) {
            // TODO - error handling
            console.error("image error:", error);
          }
        })();
        imageCancelers.current[uid] = {
          prompt,
          celebrity,
          cancel: () => {
            canceled.current = true;
          },
        };
      }
    }
  }, [addImage, celebrity, images, prompts]);

  // Judge when appropriate
  useEffect(() => {
    // Return if we already have all judgement data
    if (players.every((player) => Object.hasOwn(judgements, player.uid))) {
      return;
    }

    // Return if any player doesn't have a prompt
    if (players.some((player) => !Object.hasOwn(prompts, player.uid))) {
      return;
    }

    const canceled = { current: false };
    (async () => {
      try {
        const judgements = await stepTwo(
          { celebrity, metaprompt },
          swapUIDForName(prompts)
        );
        if (canceled.current) {
          return;
        }
        for (const [name, judgement] of Object.entries(judgements)) {
          addJudgement(UIDFromName(name), judgement);
        }
      } catch (error) {
        // TODO - error handling
        console.error("judging error:", error);
      }
    })();

    return () => {
      canceled.current = true;
    };
  }, [
    addJudgement,
    celebrity,
    judgements,
    metaprompt,
    players,
    prompts,
    UIDFromName,
    swapUIDForName,
  ]);

  // Choose winner when appropriate
  useEffect(() => {
    // If we already have a winner, don't need anything
    if (winner) {
      return;
    }

    // If we are missing judgements, we aren't ready yet
    if (players.some((player) => !Object.hasOwn(judgements, player.uid))) {
      return;
    }

    const canceled = { current: false };
    (async () => {
      try {
        const newWinner = await stepThree(
          { celebrity, metaprompt },
          swapUIDForName(prompts),
          swapUIDForName(judgements)
        );
        if (canceled.current) {
          return;
        }

        await addWinner({
          uid: UIDFromName(newWinner.name),
          message: newWinner.message,
        });
      } catch (error) {
        // TODO - error handling
        console.error("getting winner error:", error);
      }
    })();
    return () => {
      canceled.current = true;
    };
  }, [
    addWinner,
    celebrity,
    judgements,
    metaprompt,
    players,
    prompts,
    winner,
    UIDFromName,
    swapUIDForName,
  ]);

  const nextJudgement = useMemo(() => {
    const player = state.players.find(
      (player) => !Object.hasOwn(displayedJudgements, player.uid)
    );
    if (!player) {
      return undefined;
    }
    return {
      player,
      markFinished: () => {
        setDisplayedJudgement((prev) =>
          update(prev, { [player.uid]: { $set: judgements[player.uid] } })
        );
      },
    };
  }, [displayedJudgements, judgements, state.players]);
  const viewState = useMemo(() => {
    return createViewState(state, nextJudgement);
  }, [state, nextJudgement]);

  return <Display state={viewState} />;
};

export default MainGame;
