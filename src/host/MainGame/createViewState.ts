import { MainGameState, Player } from "../../game/State";
import { PastWinner } from "../../firebase/getPastWinners";
import { ViewState } from "./ViewState";

export type Judgement = {
  player: Player;
  markFinished: () => void;
};

export const createViewState = (
  state: MainGameState,
  nextJudgement: Judgement | undefined,
  pastWinners: PastWinner[]
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
    return { stage: "generating", pastWinners };
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
    const prompt = state.prompts[nextJudgement.player.uid];
    const judgement = state.judgements[nextJudgement.player.uid];
    return {
      stage: "judging",
      player: nextJudgement.player.name,
      image,
      prompt,
      judgement,
      markFinished: nextJudgement.markFinished,
    };
  }

  if (state.winner === undefined) {
    return {
      stage: "generating",
      pastWinners: [],
    };
  }
  const winner = state.winner;

  const winnerPlayer = state.players.find(
    (player) => winner.uid === player.uid
  );
  if (!winnerPlayer) {
    throw new Error("Internal error - unexpected player");
  }
  if (winner.uid) {
    return {
      stage: "winner",
      winner: winnerPlayer.name,
      message: winner.message,
      image: state.images[winner.uid],
      prompt: state.prompts[winner.uid],
      markCompleted: state.markCompleted,
    };
  }

  return {
    stage: "noWinner",
    message: winner.message,
    markCompleted: state.markCompleted,
  };
};

export default createViewState;
