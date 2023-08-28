import { FC } from "react";
import { useNavigate } from "react-router-dom";
import "./Content.scss";

const Content: FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <button
        onClick={() => {
          navigate("/host");
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
