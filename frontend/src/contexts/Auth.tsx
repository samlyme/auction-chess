import { createContext } from "react";
import type {
  UserCreate,
  UserCredentials,
  UserProfile,
} from "../schemas/types";

export interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  login: (credentials: UserCredentials) => void;
  signup: (newUser: UserCreate) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
