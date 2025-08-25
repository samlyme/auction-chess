import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { JWTPayload, UserCreate, UserCredentials, UserProfile } from "../schemas/types";
import { testAuth, usernamePasswordLogin } from "../services/auth";
import { createUser, getUserByUUID } from "../services/users";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
    token: string | null;
    user: UserProfile | null;
    login: (credentials: UserCredentials) => void;
    signup: (newUser: UserCreate) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode}) {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"))
    const [user, setUser] = useState<UserProfile | null>(null)
    
    const login = useCallback( async (credentials: UserCredentials) => {
        try {
            const res = await usernamePasswordLogin(credentials);

            localStorage.setItem("access_token", res.access_token)
            setToken(res.access_token)

            const payload: JWTPayload = jwtDecode(res.access_token);
            if (!payload) throw new Error("Invalid token")

            getUserByUUID(payload.sub)
            .then((res: UserProfile) => {
                setUser(res);
            })
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

    const context: AuthContextType = { token, user, login, signup, logout }
    if (token) {
        testAuth(token)
        .then((res) => {
            if (!res) logout();
        })
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