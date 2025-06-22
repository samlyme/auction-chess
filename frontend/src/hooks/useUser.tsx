import { useEffect, useState } from "react";
import { useAuthContext } from "../contexts/Auth";
import type { JWTPayload, UserProfile } from "../schemas/types";
import { getUserByUUID } from "../services/users";
import { jwtDecode } from "jwt-decode";

function useUser(): UserProfile | null {
    const { token } = useAuthContext();
    const [user, setUser] = useState<UserProfile | null>(null);

    if (!token) throw new Error("useUser must be called in a valid Auth context")
    
    const payload: JWTPayload= jwtDecode(token);
    if (!payload) throw new Error("Invalid token")

    useEffect(() => {
        getUserByUUID(payload.sub)
        .then((res: UserProfile) => {
            setUser(res);
        })
    }, []);

    return user;
}

export default useUser;