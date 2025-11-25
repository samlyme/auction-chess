import { createContext } from "react";
import type { Tables } from "shared";

export interface UserProfileContextType {
  profile: Tables<"profiles"> | null;
  update: (profile?: Tables<'profiles'>) => void;
  loading: boolean;
}

export const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  update: () => {},
  loading: true,
});
