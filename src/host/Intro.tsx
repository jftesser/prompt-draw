import { FC, useEffect } from "react";
import { IntroState } from "../game/State";

const Intro: FC<{ state: IntroState }> = ({ state }) => {
  const moveToMetaprompt = state.moveToMetaprompt;
  useEffect(() => {
    const canceled = { current: false };
    (async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (canceled.current) return;
      moveToMetaprompt({
        celebrity: "No one at all",
        metaprompt: "Test metaprompt",
      });
    })();
    return () => {
      canceled.current = true;
    };
  }, [moveToMetaprompt]);
  return <div>{JSON.stringify(state)}</div>;
};
export default Intro;
