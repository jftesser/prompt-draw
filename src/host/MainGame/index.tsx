import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MainGameState } from "../../game/State";
import Display from "./Display";
import createViewState from "./createViewState";
import { getImageURL, stepTwo, stepThree } from "../../gpt";
import update from "immutability-helper";
import { swapUIDForName } from "../../Utils";

const MainGame: FC<{ state: MainGameState }> = ({ state }) => {
  const [displayedJudgements, setDisplayedJudgement] = useState<{
    [uid: string]: string;
  }>({});
  const imageCancelers = useRef<{
    [uid: string]: { prompt: string; celebrity: string; cancel: () => void };
  }>({});

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
        setDisplayedJudgement((prev) => update(prev, { $unset: deleted }));
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
            const url = await getImageURL(prompt, celebrity);
            if (canceled.current) {
              return;
            }
            delete imageCancelers.current[uid];
            await addImage(uid, { status: "image", url });
          } catch (error) {
            // TODO - currently we treat every error as a content filter error.
            // Ideally we would only treat content filter errors here, but this
            // requires changes to the firebase function to not 500 on any error.
            addImage(uid, { status: "censored" });
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
          prompts
        );
        if (canceled.current) {
          return;
        }
        for (const [uid, judgement] of Object.entries(judgements)) {
          addJudgement(uid, swapUIDForName(judgement, players));
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
    prompts
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
          prompts,
          judgements
        );
        if (canceled.current) {
          return;
        }

        await addWinner({
          uid: newWinner.uid,
          message: swapUIDForName(newWinner.message, players),
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
