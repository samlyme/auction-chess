import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import useAuth from '../hooks/useAuth';
import { Tabs } from 'radix-ui';

function Auth() {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/lobbies');
  });

  return (
    <div className="auth-page">
      {/* <h2>Login</h2>
            <Login />
            <h2>Signup</h2>
            <SignUp /> */}
      <Tabs.Root defaultValue="login">
        <Tabs.List>
          <Tabs.Trigger value="login">Login</Tabs.Trigger>
          <Tabs.Trigger value="signup">Signup</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="login">
          <Login />
        </Tabs.Content>
        <Tabs.Content value="signup">
          <SignUp />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuth();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Attempting to log in with:');
    console.log('Username:', username);
    console.log('Password:', password);

    login({
      username: username,
      password: password,
    });
  };

  return (
    <div>
      <h4>Welcome back!</h4>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
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
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { signup } = useAuth();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Attempting to signup with:');
    console.log('Username:', username);
    console.log('Password:', password);

    signup({
      username: username,
      password: password,
    });
  };

  return (
    <div>
      <h4>Create new account.</h4>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
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
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
export default Auth;
