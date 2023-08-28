import { FC } from "react";
import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import LoginPage from "./Login";
import Content from "./Content";
import Host, { loader as hostLoader } from "./host";
import Play from "./Play";
import Demo from "./Demo";
import { ProtectedRoute, ProtectedRouteProps } from "./ProtectedRoute";

const App: FC = () => {
  const navigate = useNavigate();
  const onLogin = () => {
    navigate("/");
  };
  return (
    <div className="App">
    </div>
  );
};

export default App;
