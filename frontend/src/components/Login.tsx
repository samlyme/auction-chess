import { useState } from "react";
import { useAuthContext } from "../contexts/Auth";

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

export default Login