import { FC } from "react";
import "./Display.scss";

import { ViewState } from "./ViewState";
import { unreachable } from "../../Utils";
import Metaprompt from "./Metaprompt";
import Generating from "./Generating";
import Judging from "./Judging";
import WinnerReveal from "./WinnerReveal";

const Display: FC<{ state: ViewState }> = ({ state }) => {
  if (state.stage === "metaprompt") {
    return <Metaprompt state={state} />;
  }
  if (state.stage === "generating") {
    return <Generating state={state} />;
  }
  if (state.stage === "judging") {
    return <Judging state={state} />;
  }
  if (state.stage === "winner") {
    return <WinnerReveal state={state} />;
  }
  return unreachable(state);
};

export default Display;
