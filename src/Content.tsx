import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Content.scss";
import makeNewGame from "./makeNewGame";
import { auth } from "./firebase/firebaseSetup";

const Content: FC = () => {
  const navigate = useNavigate();
  const [working, setWorking] = useState(false);
  return working ? (
    <></>
  ) : (
    <>
      <button
        onClick={() => {
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
        }}
      >
        Host
      </button>
      <button
        onClick={() => {
          navigate("/game");
        }}
      >
        Play
      </button>
    </>
  );
};

export default Content;
