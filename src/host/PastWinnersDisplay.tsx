import { FC, useState, useEffect } from "react";
import { PastWinner } from "../firebase/getPastWinners";
import { Box, Card, Text } from "@chakra-ui/react";
import ImageDisplay from "./ImageDisplay";
import { useTimer } from "react-timer-hook";

const PastWinnersDisplay: FC<{ pastWinners: PastWinner[] }> = ({ pastWinners }) => {
    const dur = 5000;
    const [currIndex, setCurrIndex] = useState(0);
    const [flipState, setFlipState] = useState(true);

    const {restart} = useTimer({
        expiryTimestamp: new Date(Date.now() + dur), onExpire: () => {
            const nextInd = (currIndex + 1) % pastWinners.length;
            setCurrIndex(nextInd);
            setFlipState(!flipState);
        }
    });

    useEffect(() => {
        const time = new Date(Date.now() + dur);
        restart(time);
    }, [flipState, restart])

    const renderWinner = (winner: PastWinner) => {
        return <Card position="relative" m="1em" display="flex" flexDirection="column" alignItems="center" p="1em" background="white">
            <ImageDisplay image={winner.image} prompt="" sz="300px" />
            <Text fontSize="2xl" color="black" fontFamily='Covered By Your Grace'>{winner.celebrityName}</Text>
            <Text fontSize="2xl" color="black" fontFamily='Covered By Your Grace'>dressed by {winner.winnerName}</Text>
        </Card>;
    };
    return <div>
        {pastWinners.length ? renderWinner(pastWinners[currIndex]) : undefined}
    </div>;
};

export default PastWinnersDisplay;