import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import { Tabs } from "radix-ui";
import type { UserCredentials } from "../schemas/types";

function Auth() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  useEffect(() => {
    if (token) navigate("/lobbies");
  });

  return (
    // TODO: show currently selected tab.
    <div className="flex justify-center">
      <Tabs.Root defaultValue="login">
        <Tabs.List className="justify-self-center space-x-4">
          <Tabs.Trigger value="login">Login</Tabs.Trigger>
          <Tabs.Trigger value="signup">Signup</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="login">
          <AuthMenu title="Welcome back!" submitCredentials={login} />
        </Tabs.Content>
        <Tabs.Content value="signup">
          <AuthMenu title="Create account." submitCredentials={signup} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function AuthMenu({
  title,
  submitCredentials,
}: {
  title: string;
  submitCredentials: (credentials: UserCredentials) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Attempting to log in with:");
    console.log("Username:", username);
    console.log("Password:", password);

    submitCredentials({
      username: username,
      password: password,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-7 p-7">
      <h1 className="text-3xl">{title}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            className="bg-gray-300 border-2 rounded m-2"
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            className="bg-gray-300 border-2 rounded m-2"
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="rounded bg-green-500 px-4 py-2 text-white"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default Auth;
