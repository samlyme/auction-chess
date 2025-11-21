import { createContext } from "react";
import type { Session } from "@supabase/auth-js";

export interface AuthContextType {
    session: Session | null;
    loading: boolean;
}
export const AuthContext = createContext<AuthContextType>({session: null, loading: true})