import { Metaprompt, Image } from "../../game/State";
import { PastWinner } from "../../firebase/getPastWinners";

export type MetapromptState = {
  stage: "metaprompt";
  metaprompt: Metaprompt;
};

export type GeneratingState = {
  stage: "generating";
  // this will be an empty list if no winners should be shown or there is an error retrieving them
  pastWinners: PastWinner[];
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
