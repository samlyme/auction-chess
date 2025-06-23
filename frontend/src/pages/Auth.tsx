import { useState } from "react";
import { useAuthContext } from "../contexts/Auth";

function Auth() {
    return (
        <div className="auth-page">
            <h1>Login</h1>
            <Login />
            <h1>Signup</h1>
            <SignUp />
        </div>
    )
}

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { login } = useAuthContext();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('Attempting to log in with:');
        console.log('Username:', username);
        console.log('Password:', password);

        login({
            username: username,
            password: password,
        })
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                <label htmlFor="username">Username:</label>
                <input 
                    type="text" 
                    id="username" 
                    name="username" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                </div>
                <div>
                <label htmlFor="password">Password:</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                </div>
                <button type="submit">Log In</button>
            </form>
        </div>
    );
}

function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { signup } = useAuthContext();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('Attempting to signup with:');
        console.log('Username:', username);
        console.log('Password:', password);

        signup({
            username: username,
            password: password,
        })
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                <label htmlFor="username">Username:</label>
                <input 
                    type="text" 
                    id="username" 
                    name="username" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                </div>
                <div>
                <label htmlFor="password">Password:</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                </div>
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );

}
export default Auth;