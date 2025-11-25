import { createContext } from "react";
import type { Tables } from "../supabase";

export interface UserProfileContextType {
  profile: Tables<"profiles"> | null;
  invalidate: () => void;
  loading: boolean;
}

export const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  invalidate() {},
  loading: true,
});
