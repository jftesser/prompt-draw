import { useContext } from "react";
import { AuthContext } from "./auth/AuthContext";
import LoginPage from "./Login";

export type ProtectedRouteProps = {
  redirect?: JSX.Element;
  outlet: JSX.Element;
};

export const ProtectedRoute = ({
  redirect = <LoginPage />,
  outlet,
}: ProtectedRouteProps) => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = !!authContext.user;
  if (isAuthenticated) {
    return outlet;
  } else {
    return redirect;
  }
};
