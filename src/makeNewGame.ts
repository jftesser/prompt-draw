import { ref, set } from "firebase/database";
import { database } from "./firebase/firebaseSetup";

const bytesToBase64 = (bytes: ArrayBuffer): string => {
  const binString = Array.from(new Uint8Array(bytes), (x) =>
    String.fromCodePoint(x)
  ).join("");
  return btoa(binString).replace("+", "-").replace("/", "_");
};

const makeNewGame = async (uid: string): Promise<string | null> => {
  const stamp = Date.now().toString();
  const encoder = new TextEncoder();
  for (let guessIndex = 0; guessIndex < 10; guessIndex++) {
    const data = encoder.encode(stamp + uid + guessIndex.toString());
    const guess = bytesToBase64(
      (await crypto.subtle.digest("SHA-256", data)).slice(0, 3)
    );
    try {
      await set(ref(database, `games/${guess}/host`), uid);
      return guess;
    } catch {}
  }
  return null;
};

export default makeNewGame;
