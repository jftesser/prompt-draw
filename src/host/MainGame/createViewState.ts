import { MainGameState, Player } from "../../game/State";
import { ViewState } from "./ViewState";

export type Judgement = {
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
    const image = state.images[nextJudgement.player.uid];
    const judgement = state.judgements[nextJudgement.player.uid];
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
    image: state.images[winner.uid],
    markCompleted: state.markCompleted,
  };
};

export default createViewState;
