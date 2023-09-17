import { FC, FormEvent, useCallback, useRef, useState } from "react";
import { GetPromptState } from "../game/PlayerState";
import { Button, Textarea, Heading, Text, Box } from '@chakra-ui/react';
import Timer from "../Timer";

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

  const time = useRef((() => {
    const trash = new Date();
    trash.setSeconds(trash.getSeconds() + 120);
    return trash;
  })());

  const now = useRef(new Date());

  return (
    <div>

      <div>
        <Heading fontSize={["4em", "6em"]} lineHeight="0.8" mb="1rem">Your challenge:</Heading>
        <Text fontSize={"1em"}>{state.metaprompt.metaprompt}</Text>
      </div>

      <div>
        <Heading fontSize={["4em", "6em"]} lineHeight="0.8" mt="1em" mb="1rem">Your response:</Heading>
        <Box mb="1em">
          <Text fontSize={"1em"}>You have two minutes! Tick. Tock.</Text>
          <Timer currentTimestamp={now.current} expiryTimestamp={time.current} callback={() => { getPrompt(prompt.length ? prompt : "a clown suit") }} />
        </Box>
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
