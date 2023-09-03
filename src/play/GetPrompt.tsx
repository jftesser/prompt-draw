import { FC, FormEvent, useCallback, useState } from "react";
import { GetPromptState } from "../game/PlayerState";
import { Button } from '@chakra-ui/react';

const GetPrompt: FC<{ state: GetPromptState }> = ({ state }) => {
  const [prompt, setPrompt] = useState("");
  const getPrompt = state.getPrompt;
  const onPrompt = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      getPrompt(prompt);
    },
    [prompt, getPrompt]
  );
  return (
    <div>
      <span>{JSON.stringify(state)}</span>
      <form className="prompt-form" onSubmit={onPrompt}>
        <input
          type="text"
          placeholder="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />
        <Button type="submit">Set Prompt</Button>
      </form>
    </div>
  );
};
export default GetPrompt;
