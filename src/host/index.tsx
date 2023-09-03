import { FC, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get, ref } from "firebase/database";
import { database } from "../firebase/firebaseSetup";
import useStateFromDatabase from "../game/useStateFromDatabase";
import Display from "./Display";

export type RouteArgs = {
  params: Record<string, string | undefined>;
};

export const Host: FC = () => {
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

  const state = useStateFromDatabase(params.gameId);

  if (state === undefined) {
    return <span>Loading...</span>;
  }

  if (state.status === "error") {
    return <div className="full"><span>Error! {state.error}</span></div>;
  }

  return <Display state={state.state} />;
};

export default Host;
