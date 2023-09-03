import { Metaprompt } from "../../game/State";

export type MetapromptState = {
  stage: "metaprompt";
  metaprompt: Metaprompt;
};

export type GeneratingState = {
  stage: "generating";
};

export type JudgingState = {
  stage: "judging";
  player: string;
  judgement: string;
  image: string;
  markFinished: () => void;
};

export type WinnerRevealState = {
  stage: "winner";
  winner: string;
  message: string;
  image: string;
  markCompleted: () => void;
};

export type ViewState =
  | MetapromptState
  | GeneratingState
  | JudgingState
  | WinnerRevealState;
