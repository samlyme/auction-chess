import { createContext } from "react";
import type { Session, User } from "@supabase/auth-js";

export interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
}
export const AuthContext = createContext<AuthContextType>({session: null, user: null, loading: true})