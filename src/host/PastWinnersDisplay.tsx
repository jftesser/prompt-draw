import { FC, useState, useMemo, useEffect } from "react";
import { Card, Text } from "@chakra-ui/react";
import ImageDisplay from "./ImageDisplay";
import { useTimer } from "react-timer-hook";
import { PastWinner } from "../game/State";

const PastWinnersDisplay: FC<{ pastWinners: PastWinner[] }> = ({ pastWinners }) => {
    const dur = 5000;
    const numWinners = pastWinners.length;
    const getNextIndex = useMemo(() => {
        if (numWinners === 0) return () => undefined;
        const availableIndices = new Set<number>(Array.from(Array(numWinners).keys()));
        const lastIndex = { current: undefined }
        return () => {
            if (availableIndices.size === 0) {
                for (let i = 0; i < numWinners; i++) {
                    if (i !== lastIndex.current) {
                        availableIndices.add(i);
                    }
                }
            }
            const index = Math.floor(Math.random() * availableIndices.size);

            const values = availableIndices.values();
            for (let i = 0; i < index; i++) {
                values.next();
            }
            const next = values.next().value;
            availableIndices.delete(next);
            lastIndex.current = next
            return next;
        }
    }, [numWinners])

    const [currIndex, setCurrIndex] = useState(undefined);
    useEffect(() => {
        setCurrIndex(getNextIndex());
    }, [getNextIndex])

    const {restart} = useTimer({
        expiryTimestamp: new Date(Date.now() + dur), onExpire: () => {
            setCurrIndex(getNextIndex());
            setTimeout(() => {restart(new Date(Date.now() + dur))}, 0);
        }
    });

    const renderWinner = (winner: PastWinner) => {
        return <Card position="relative" m="1em" display="flex" flexDirection="column" alignItems="center" p="1em" background="white">
            <ImageDisplay image={winner.image} prompt="" sz="300px" />
            <Text fontSize="2xl" color="black" fontFamily='Covered By Your Grace'>{winner.celebrityName}</Text>
            <Text fontSize="2xl" color="black" fontFamily='Covered By Your Grace'>dressed by {winner.winnerName}</Text>
        </Card>;
    };
    return <div>
        {(pastWinners.length && currIndex !== undefined) ? renderWinner(pastWinners[currIndex]) : undefined}
    </div>;
};

export default PastWinnersDisplay;