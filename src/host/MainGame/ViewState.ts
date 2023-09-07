import { Metaprompt, Image } from "../../game/State";

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
  image: Image;
  prompt: string;
  markFinished: () => void;
};

export type WinnerRevealState = {
  stage: "winner";
  winner: string;
  message: string;
  image: Image;
  prompt: string;
  markCompleted: () => void;
};

export type ViewState =
  | MetapromptState
  | GeneratingState
  | JudgingState
  | WinnerRevealState;
