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
        <Heading fontSize={["4em", "6em"]} lineHeight="0.8" mb="1rem">Your challenge:</Heading>
        <Text fontSize={["1em", "2em"]}>{state.metaprompt.metaprompt}</Text>
      </div>

      <div>
        <Heading fontSize={["4em", "6em"]} lineHeight="0.8" mt="1em" mb="1rem">Your response:</Heading>
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
