import { Button } from '@chakra-ui/react'
import { useTts } from 'tts-react';
import type { TTSHookProps } from 'tts-react';

type SpeakProps = Pick<TTSHookProps, 'children'>

const Speak = ({ children }: SpeakProps) => {
  const { ttsChildren, state, play } = useTts({
    children,
    markTextAsSpoken: true,
    markBackgroundColor: "white",
  })

  return (
    <>
      {ttsChildren}
      <>
        <Button mt="1rem" backgroundColor={"white"} color={"black"} _hover={{backgroundColor: "rgba(255,255,255,0.8)"}} alignSelf={"start"} disabled={state.isPlaying} onClick={play} fontSize={"2em"}>⏵</Button>
      </>
      
    </>
  )
}

export default Speak;