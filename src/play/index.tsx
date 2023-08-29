import { FC, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get, ref } from "firebase/database";
import { database } from "../firebase/firebaseSetup";
import Display from "./Display";
import usePlayerState from "../game/usePlayerState";
import { AuthContext } from "../auth/AuthContext";

export type RouteArgs = {
  params: Record<string, string | undefined>;
};

export const Play: FC = () => {
  const params = useParams();
  const nav = useNavigate();

  // Redirect if game is invalid or does not exist
  useEffect(() => {
    if (!params.gameId) {
      nav("/");
    }

    const canceled = { current: false };
    (async () => {
      const exists = (
        await get(ref(database, `games/${params.gameId}`))
      ).exists();
      if (!exists && !canceled.current) {
        nav("/");
      }
    })();
    return () => {
      canceled.current = true;
    };
  }, [params.gameId, nav]);

  const authContext = useContext(AuthContext);

  const state = usePlayerState(params.gameId, authContext.user?.uid);

  if (state === undefined) {
    return <span>Loading...</span>;
  }

  if (state.status === "error") {
    return <span>Error! {state.error}</span>;
  }

  return <Display state={state.state} />;
};

export default Play;
