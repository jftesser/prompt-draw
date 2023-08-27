import React, { FormEvent, useState } from "react";
import { signIn } from "./firebase/firebaseSetup";
import "./Login.scss";

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await signIn(email, password);
            onLogin();
        } catch (error) {
            setError(error as any);
        }
    };

    return (
        <div className="login">
            <div>
                <h1>Login</h1>
                <form className="login-form" onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
                {error && <p>{error}</p>}
            </div>
        </div>
    );
};

export default LoginPage;