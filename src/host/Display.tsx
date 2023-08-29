import "./Display.scss";

import { State } from "../game/State";
import { FC } from "react";

const Display: FC<{ state: State }> = ({ state }) => {
  return <div>{JSON.stringify(state)}</div>;
};

export default Display;
