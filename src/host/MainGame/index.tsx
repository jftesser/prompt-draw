import { FC, useMemo, useState } from "react";
import { MainGameState, Player } from "../../game/State";
import { ViewState } from "./ViewState";
import Display from "./Display";
import { stat } from "fs";

type Judgement = {
  player: Player;
  markFinished: () => void;
};

export const createViewState = (
  state: MainGameState,
  nextJudgement: Judgement | undefined
): ViewState => {
  if (
    state.players.some((player) => !Object.hasOwn(state.prompts, player.uid))
  ) {
    return {
      stage: "metaprompt",
      metaprompt: state.metaprompt,
    };
  }

  if (
    state.players.some((player) => !Object.hasOwn(state.images, player.uid)) ||
    state.players.some((player) => !Object.hasOwn(state.judgements, player.uid))
  ) {
    return { stage: "generating" };
  }

  if (nextJudgement) {
    if (
      state.players.find(
        (player) => player.uid === nextJudgement.player.uid
      ) === undefined
    ) {
      throw new Error("Internal error - unexpected player");
    }

    // Note - we checked above that all players have a judgement and image
    const image = state.judgements[nextJudgement.player.uid] as string;
    const judgement = state.judgements[nextJudgement.player.uid] as string;
    return {
      stage: "judging",
      player: nextJudgement.player.name,
      image,
      judgement,
      markFinished: nextJudgement.markFinished,
    };
  }

  if (state.winner === undefined) {
    return {
      stage: "generating",
    };
  }
  const winner = state.winner;

  const winnerPlayer = state.players.find(
    (player) => winner.uid === player.uid
  );
  if (!winnerPlayer) {
    throw new Error("Internal error - unexpected player");
  }
  return {
    stage: "winner",
    winner: winnerPlayer.name,
    message: winner.message,
    markCompleted: state.markCompleted,
  };
};

const MainGame: FC<{ state: MainGameState }> = ({ state }) => {
  const [displayedJudgements, setDisplayedJudgement] = useState<string[]>([]);
  const nextJudgement = useMemo(() => {
    const player = state.players.find((player) => {
      return !displayedJudgements.includes(player.uid);
    });
    if (!player) {
      return undefined;
    }
    return {
      player,
      markFinished: () => {
        setDisplayedJudgement((prev) => [...prev, player.uid]);
      },
    };
  }, [displayedJudgements, state.players]);
  const viewState = useMemo(() => {
    return createViewState(state, nextJudgement);
  }, [state, nextJudgement]);

  return <Display state={viewState} />;
};

export default MainGame;
