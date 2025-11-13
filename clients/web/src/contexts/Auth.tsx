import { createContext } from "react";
import type { Session } from "@supabase/auth-js";

export const AuthContext = createContext<Session | null>(null)