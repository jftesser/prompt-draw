import { get,ref, query, equalTo, orderByChild } from "firebase/database";
import { database } from "./firebaseSetup";
import { Image } from "../game/State";

export type PastWinner = {
    image: Image;
    winnerName: string;
    celebrityName: string;
}

export const getPastWinners = async (): Promise<PastWinner[]> => {
    const gamesRef = query(ref(database, "games"), orderByChild("completed"), equalTo(true));
    // consider swithching to getting once with onValue
    const games = await get(gamesRef);
    const pastWinners: PastWinner[] = [];
    games.forEach((game) => {
        if (game.hasChild("winner/uid") && game.hasChild("metaprompt/celebrity") && game.hasChild("started/players") && game.hasChild("images")) {
            const winnerUid = game.child("winner/uid").val();
            const winnerImage = game.child(`images/${winnerUid}`).val();
            const celebrityName = game.child("metaprompt/celebrity").val();
            const players = game.child("started/players");
            let winnerName = "";
            players.forEach((player) => {
                if (player.child("uid").val() === winnerUid) {
                    winnerName = player.child("name").val();
                }
            });
            if (winnerImage && winnerName && celebrityName) {
                pastWinners.push({
                    image: winnerImage,
                    winnerName,
                    celebrityName
                });
            }
        }
    });
    return pastWinners;
}