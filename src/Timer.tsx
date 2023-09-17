import { FC } from 'react';
import { useTimer } from 'react-timer-hook';
import { Progress, Text, Flex } from '@chakra-ui/react';

const Timer: FC<{ currentTimestamp: Date, expiryTimestamp: Date, callback: () => void }> = ({ currentTimestamp, expiryTimestamp, callback }) => {
    const {
        totalSeconds,
        seconds,
        minutes,
    } = useTimer({ expiryTimestamp, onExpire: () => callback() });

    const duration = (expiryTimestamp.getTime() - currentTimestamp.getTime())/1000;

    return (
        <Flex w="100%" direction="column" alignItems="end">
            <Progress colorScheme='whiteAlpha' w="100%" value={(1.0-totalSeconds/duration)*100} />
            <Text fontSize={"1em"}>
                <span>{minutes}</span>:<span>{seconds.toString().padStart(2, '0')}</span>
            </Text>

        </Flex>
    );
}

export default Timer;