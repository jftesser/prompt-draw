import { FC, FormEvent, useState } from "react";
import "./Content.scss";
import { getImage } from "./firebase/firebaseSetup";

const Content: FC = () => {
    const [imageUrl, setImageUrl] = useState("");
    const [awaitingImage, setAwaitingImage] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [error, setError] = useState("");

    const handlePrompt = async (e: FormEvent) => {
        e.preventDefault();
        setAwaitingImage(true);
        try {
            // go get the image
            console.log('prompt', prompt);
            const url = (await getImage(prompt)).data as string;
            console.log('url', url);
            setImageUrl(url);
            setAwaitingImage(false);
        } catch (error) {
            console.error('handlePrompt error:', error);
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
                    <button type="submit" disabled={awaitingImage}>Get image</button>
                </form>
                {error && <p>{error}</p>}
                {imageUrl && <img src={imageUrl} alt="prompt response" />}
            </div>
        </div>
    );
}

export default Content;