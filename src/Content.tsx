import { FC, FormEvent, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Content.scss";
import makeNewGame from "./makeNewGame";
import { auth } from "./firebase/firebaseSetup";
import joinGame from "./joinGame";

const Content: FC = () => {
  const navigate = useNavigate();
  const [working, setWorking] = useState(false);
  const [gameId, setGameId] = useState("");
  const onMakeGame = useCallback(() => {
    setWorking(true);
    (async () => {
      try {
        if (!auth.currentUser) {
          throw new Error("Not logged in");
        }

        const game = await makeNewGame(auth.currentUser.uid);
        if (!game) {
          throw new Error("Failed to create game");
        } else {
          navigate(`/host/${game}`);
        }
      } catch {
        setWorking(false);
      }
    })();
  }, [navigate]);
  const onJoinGame = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      setWorking(true);
      (async () => {
        try {
          if (!auth.currentUser) {
            throw new Error("Not logged in");
          }

          await joinGame(gameId, auth.currentUser.uid);

          navigate(`/play/${gameId}`);
        } catch (e) {
          setWorking(false);
        }
      })();
    },
    [gameId, navigate]
  );
  return working ? (
    <></>
  ) : (
    <>
      <div>
        <button onClick={onMakeGame}>Host</button>
      </div>
      <form className="join-game-form" onSubmit={onJoinGame}>
        <input
          type="text"
          placeholder="game code"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          required
        />
        <button type="submit">Join Game</button>
      </form>
      <div>
        <button
          onClick={() => {
            navigate("/demo");
          }}
        >
          Demo
        </button>
      </div>
    </>
  );
};

export default Content;
