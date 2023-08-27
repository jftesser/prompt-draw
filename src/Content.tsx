import { FC, FormEvent, useState } from "react";
import "./Content.scss";

const Content: FC = () => {
    
    const [prompt, setPrompt] = useState("");
    const [error, setError] = useState("");

    const handlePrompt = async (e: FormEvent) => {
        e.preventDefault();
        try {
            // go get the image
        } catch (error) {
            setError(error as any);
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
                    />
                    <button type="submit">Get image</button>
                </form>
                {error && <p>{error}</p>}
            </div>
        </div>
    );
}

export default Content;