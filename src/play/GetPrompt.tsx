import { FC, FormEvent, useCallback, useState } from "react";
import { GetPromptState } from "../game/PlayerState";
import { Button, Textarea, Heading, Text } from '@chakra-ui/react';

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
      <div>
        <Heading>Your challenge:</Heading>
        <Text>{state.metaprompt.metaprompt}</Text>
      </div>

      <div>
        <Heading mt="1em">Your response:</Heading>
        <form className="prompt-form" onSubmit={onPrompt}>
          <Textarea
            placeholder="your truly spectacular description of the perfect garment"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />
          <Button mt="1em" variant="outline" type="submit">Judge my creative soul</Button>
          {/* TODO add cheating button */}
        </form>
      </div>
    </div>
  );
};
export default GetPrompt;
