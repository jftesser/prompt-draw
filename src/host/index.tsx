import { FC } from "react";
import "./index.scss";
import { redirect, useParams } from "react-router-dom";

export type RouteArgs = {
  params: Record<string, string | undefined>;
};

export const loader = async ({
  params,
}: RouteArgs): Promise<null | Response> => {
  console.log("hello");
  const gameId = params["gameId"];
  if (!gameId) {
    return redirect("/");
  }
  if (gameId === "bad") {
    return redirect("/");
  }
  return null;
};

export const Host: FC = () => {
  const params = useParams();
  return <span>Hello, {params["gameId"] ?? "Invalid"}!</span>;
};

export default Host;
