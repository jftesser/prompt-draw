import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import {
  RouterProvider,
  createBrowserRouter,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import LoginPage from "./Login";
import Content from "./Content";
import Host from "./host";
import Play from "./Play";
import Demo from "./Demo";

const LoginAndRerouteToRoot = () => {
  const navigate = useNavigate();
  const onLogin = () => {
    navigate("/");
  };
  return <LoginPage onLogin={onLogin} />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute outlet={<Content />} />,
  },
  {
    path: "host/:gameId",
    element: <ProtectedRoute outlet={<Host />} />,
  },
  {
    path: "play/:gameId",
    element: <ProtectedRoute outlet={<Play />} />,
  },
  {
    path: "demo",
    element: <ProtectedRoute outlet={<Demo />} />,
  },
  {
    path: "login",
    element: <LoginAndRerouteToRoot />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
