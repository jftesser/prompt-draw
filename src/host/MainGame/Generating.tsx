import { FC } from "react";
import { GeneratingState } from "./ViewState";
import { Spinner } from '@chakra-ui/react';

const Generating: FC<{ state: GeneratingState }> = ({ state }) => {
  return <div>{JSON.stringify(state)}
    <Spinner size="xl" />
  </div>;
};
export default Generating;
