import "./Game.scss";
import { FC, FormEvent, useState } from "react";
import { getImage } from "./firebase/firebaseSetup";
import Chat from "./Chat";

export const Game: FC = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [awaitingImage, setAwaitingImage] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");

  const handlePrompt = async (e: FormEvent) => {
    e.preventDefault();
    setAwaitingImage(true);
    try {
      // go get the image
      console.log("prompt", prompt);
      const urls = (await getImage({ prompt, count: 1 })).data as string;
      console.log("urls", urls);
      setImageUrl(urls[0]);
      setAwaitingImage(false);
    } catch (error) {
      console.error("handlePrompt error:", error);
      setAwaitingImage(false);
      setError(JSON.stringify(error));
    }
  };

  return (
    <div className="content">
      <div>
        <h1>Get us an image for great good</h1>
        <form className="prompt-form" onSubmit={handlePrompt}>
          <input
            type="text"
            placeholder="image prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
            disabled={awaitingImage}
          />
          <button type="submit" disabled={awaitingImage}>
            Get image
          </button>
        </form>
        {error && <p>{error}</p>}
        {imageUrl && <img src={imageUrl} alt="prompt response" />}
      </div>
      <div>
        <Chat />
      </div>
    </div>
  );
};

export default Game;
