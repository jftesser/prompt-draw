import { FC } from "react";
import { CompletedState } from "../game/State";
import { Heading, Text, Box } from '@chakra-ui/react';
import ImageDisplay from "./ImageDisplay";

const Completed: FC<{ state: CompletedState }> = ({ state }) => {
  const imgData = Object.entries(state.images).map(([uid, image]) => {
    return { image, prompt: state.prompts[uid], name: state.players.find((player) => player.uid === uid)?.name ?? "Unknown Player" };
  });

  const renderImage = (image: any, prompt: string, name: string) => {
    return <Box key={name} display="flex" flexDirection="column" alignItems="center" p="1em"><Text fontSize="2xl">{name}</Text>
    <ImageDisplay image={image} prompt={prompt} sz="25vh" />
    </Box>;
  };

  return <>
  <Box display="flex">{imgData.slice(0, Math.floor(imgData.length*0.5)).map((img) => {
    return renderImage(img.image, img.prompt, img.name);
  })}</Box>
  <Heading size="4xl" mb="0.5em">That's all folks!</Heading>
  <Text fontSize="2xl">Congrats to {state.winner.name}! You did slightly better than everyone else. Don't forget, though, there's room for improvement.</Text>
  {imgData.slice(Math.floor(imgData.length*0.5)).map((img) => {
    return renderImage(img.image, img.prompt, img.name);
  })}
  </>;
};
export default Completed;
