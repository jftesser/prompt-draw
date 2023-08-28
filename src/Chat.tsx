import { FC, FormEvent, useState } from "react";
import { Message } from "./types";
import { getChat } from "./firebase/firebaseSetup";

const Chat: FC = () => {

    const [systemNote, setSystemNote] = useState<string>("You are a snarky assistant.");
    const [messages, setMessages] = useState<Message[]>([]);
    const [userMessage, setUserMessage] = useState<string>("");
    const [awaitingChat, setAwaitingChat] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (userMessage.length) {
            messages.push({ role: "user", content: userMessage });
            setMessages([...messages]);
            setUserMessage("");
            setAwaitingChat(true);
            try {
                const mess = await getChat({
                    messages: [{ role: "system", content: systemNote }, ...messages],
                    temp: 0.7,
                    model: "gpt-4"
                });
                console.log('mess', mess);
                messages.push(mess.data as Message);
                setMessages([...messages]);
                setAwaitingChat(false);
            } catch (error) {
                console.error('handlePrompt error:', error);
                setAwaitingChat(false);
                setError(JSON.stringify(error));
            }

        }
    };

    return (
        <div className="chat">
            <div>
                <h1>Chat</h1>

                <form className="chat-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="system note"
                        value={systemNote}
                        onChange={(e) => setSystemNote(e.target.value)}
                        required
                        disabled={awaitingChat}
                    />

                    <div className="messages">
                        {messages.map((message, i) => (
                            <div key={i}>
                                <p>{message.role}</p>
                                <p>{message.content}</p>
                            </div>
                        ))}
                    </div>

                    <input
                        type="text"
                        placeholder="message"
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        required
                        disabled={awaitingChat}
                    />
                    <button type="submit" disabled={awaitingChat}>Send</button>
                </form>
                {error && <p>{error}</p>}
            </div>
        </div>
    );
}

export default Chat;