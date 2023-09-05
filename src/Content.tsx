import { FC, FormEvent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Content.scss";
import makeNewGame from "./makeNewGame";
import { auth, database } from "./firebase/firebaseSetup";
import joinGame from "./joinGame";
import { Input, Button, Heading, Text, Flex, Divider } from "@chakra-ui/react";
import { get, ref } from "firebase/database";

const Content: FC = () => {
  const navigate = useNavigate();
  const [working, setWorking] = useState(false);
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [hoster, setHoster] = useState(false);
  useEffect(() => {
    const canceled = { current: false };
    (async () => {
      try {
        if (!auth.currentUser) {
          throw new Error("Not logged in");
        }
        const hoster = await get(
          ref(database, `hosters/${auth.currentUser.uid}`)
        );
        if (canceled.current) return;
        setHoster(hoster.exists());
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      canceled.current = true;
    };
  }, []);
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
          await joinGame(gameId, auth.currentUser.uid, playerName);

          navigate(`/play/${gameId}`);
        } catch (e) {
          setWorking(false);
        }
      })();
    },
    [gameId, navigate, playerName]
  );
  return working ? (
    <></>
  ) : (
    <div className="full">
      <div>
        <Text>Prompt Draw</Text>
        <Heading as="h1" size="4xl">
          Fashion Frenzy
        </Heading>
      </div>
      <Flex align="center">
        <form className="join-game-form" onSubmit={onJoinGame}>
          <Input
            mt="0.5em"
            mb="0.5em"
            type="text"
            placeholder="game code"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            required
          />
          <Input
            mt="0.5em"
            mb="0.5em"
            type="text"
            placeholder="your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
          />
          <Button mt="0.5em" mb="0.5em" variant="outline" type="submit">
            Join Game
          </Button>
        </form>
        <Divider orientation="vertical" ml="2em" mr="2em" />

        {hoster ? (
          <Button mt="0.5em" mb="0.5em" variant="outline" onClick={onMakeGame}>
            Host
          </Button>
        ) : (
          <></>
        )}
      </Flex>

      <div>
        <Button
          variant="link"
          onClick={() => {
            navigate("/demo");
          }}
        >
          Demo
        </Button>
      </div>
    </div>
  );
};

export default Content;
