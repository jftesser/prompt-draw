import { FC } from "react";
import { IntroState } from "../game/PlayerState";

const Intro: FC<{ state: IntroState }> = ({ state }) => {
  return <div>{JSON.stringify(state)}</div>;
};
export default Intro;
