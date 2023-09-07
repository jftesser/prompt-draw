import { FC } from "react";
import { Image as ImageType } from "../game/State";
import { Image, Text, Box } from "@chakra-ui/react";
import "./ImageDisplay.scss";

const ImageDisplay: FC<{ image: ImageType, prompt: string, sz: string }> = ({ image, prompt, sz }) => {
  return <Box width={sz} className="image-display" pos="relative">{image.status === "image" ?
  <Image width="100%" src={image.url} alt="prompt response" /> : <div className="host-maingame-judging-censored">CENSORED</div>}
  <Text className="caption" pos="absolute" bottom="0" p="0.5em" backgroundColor="rgba(0,0,0,0.4)" color="white">{prompt}</Text>
  </Box>;
};

export default ImageDisplay;