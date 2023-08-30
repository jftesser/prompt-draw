import { FC, useEffect } from "react";
import { IntroState } from "../game/State";
import { stepOne } from "../gpt";

const Intro: FC<{ state: IntroState }> = ({ state }) => {
  const moveToMetaprompt = state.moveToMetaprompt;
  useEffect(() => {
    const canceled = { current: false };
    (async () => {
      try {
        const metaprompt = await stepOne() as any;
        if (canceled.current) return;
        moveToMetaprompt(metaprompt);
      } catch (error) {
        console.error("handlePrompt error:", error);
        // not sure how we're handling errors, should we try again?
      }
    })();
    return () => {
      canceled.current = true;
    };
  }, [moveToMetaprompt]);
  return <div>{JSON.stringify(state)}</div>;
};
export default Intro;
