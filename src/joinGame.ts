import {
  ref,
  get,
  query,
  equalTo,
  push,
  orderByChild,
} from "firebase/database";
import { database } from "./firebase/firebaseSetup";

const joinGame = async (gameId: string, uid: string): Promise<void> => {
  if (!gameId) {
    throw new Error("Invalid Game ID");
  }

  // Check if we are already in game
  const gameRef = await get(
    query(ref(database, `players/${gameId}`), orderByChild("uid"), equalTo(uid))
  );
  if (gameRef.exists()) {
    return;
  }

  // We aren't in the game, check if the game exists
  const game = await get(ref(database, `games/${gameId}`));
  if (!game.exists()) {
    throw new Error("Game does not exist");
  }

  // Add ourselves to the game!
  await push(ref(database, `players/${gameId}`), { uid });
};

export default joinGame;
