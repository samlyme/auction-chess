import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { UserCreate, UserCredentials, UserProfile } from "../schemas/types";
import { testAuth, usernamePasswordLogin } from "../services/auth";
import { createUser } from "../services/users";

interface AuthContextType {
    token: string | null;
    login: (credentials: UserCredentials) => void;
    signup: (newUser: UserCreate) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode}) {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"))
    
    const login = useCallback( async (credentials: UserCredentials) => {
        try {
            const res = await usernamePasswordLogin(credentials);

            localStorage.setItem("access_token", res.access_token)
            setToken(res.access_token)
        }
        catch (err) {
            console.error("failed to login", err);
        }
    }, [])

    const signup = (newUser: UserCreate) => {
        createUser(newUser)
        .then((_: UserProfile) => {
            login({
                username: newUser.username,
                password: newUser.password,
            })
        })
    }

    const logout = () => {
        setToken(null);
        localStorage.removeItem("access_token");
    }

    const context: AuthContextType = { token, login, signup, logout }
    if (token) {
        testAuth(token)
        .then((res) => {
            console.log("Auth test success:", res);
        });
    }

    return (
        <AuthContext value={context}>
            {children}
        </AuthContext>
    )
}

export function useAuthContext(): AuthContextType {
    const out = useContext(AuthContext);
    if (!out) throw Error("useAuthContext must be used within an AuthProvider")
    return out;
}