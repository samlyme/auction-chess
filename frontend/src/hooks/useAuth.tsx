import { useContext } from "react";
import { AuthContext, type AuthContextType } from "../contexts/Auth";


export function useAuth(): AuthContextType {
    const out = useContext(AuthContext);
    if (!out) throw Error("useAuthContext must be used within an AuthProvider")
    return out;
}