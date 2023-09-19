import { FC } from "react";
import { CompletedState } from "../game/State";
import { Heading, Text, Box, Card } from '@chakra-ui/react';
import ImageDisplay from "./ImageDisplay";
import "./Completed.scss";
import Speak from "../Speak";

const Completed: FC<{ state: CompletedState }> = ({ state }) => {
  const imgData = Object.entries(state.images).map(([uid, image]) => {
    return { image, prompt: state.prompts[uid], name: state.players.find((player) => player.uid === uid)?.name ?? "Unknown Player" };
  });

  const renderImage = (image: any, prompt: string, name: string) => {
    const isTheWinner = state.winner.name === name;
    return <Card position="relative" key={name} m="1em" display="flex" flexDirection="column" alignItems="center" p="1em" background="white">
      {isTheWinner && <div className="star">★</div>}
      <ImageDisplay image={image} prompt={prompt} sz="20vh" />
      <Text fontSize="2xl" color="black" fontFamily='Covered By Your Grace'>{name}</Text>
    </Card>;
  };

  return <>
    <Box display="flex">{imgData.slice(0, Math.floor(imgData.length * 0.5)).map((img) => {
      return renderImage(img.image, img.prompt, img.name);
    })}</Box>
    <Speak>
      <Heading fontSize={["4em", "6em"]} mb="0.5em" mt="0.5em" lineHeight="0.8">That's all folks!</Heading>
      <Text fontSize="2xl">Congrats to {state.winner.name}! You did slightly better than everyone else. Don't forget, though, there's room for improvement.</Text>
    </Speak>
    <Box display="flex">{imgData.slice(Math.floor(imgData.length * 0.5)).map((img) => {
      return renderImage(img.image, img.prompt, img.name);
    })}</Box>
  </>;
};
export default Completed;
