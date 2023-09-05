import React, { FormEvent, useState } from "react";
import { signIn, signInWithGoogle } from "./firebase/firebaseSetup";
import "./Login.scss";
import { Input, Button, Flex, Divider } from "@chakra-ui/react";

interface LoginPageProps {
  onLogin?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      onLogin?.();
    } catch (error) {
      setError(error as any);
    }
  };

  return (
    <div className="login">
      <div>
        <h1>Login</h1>
        <Flex align="center">
          <form className="login-form" onSubmit={handleLogin}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit">Login</Button>
          </form>
          <Divider orientation="vertical" ml="2em" mr="2em" />
          <Button
            onClick={() => {
              signInWithGoogle();
            }}
          >
            Login with Google
          </Button>
        </Flex>
        {error && <p>{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
