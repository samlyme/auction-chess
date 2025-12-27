import { createContext } from "react";
import type { Profile } from "shared";

export interface UserProfileContextType {
  profile: Profile | null;
  update: (profile?: Profile) => void;
  loading: boolean;
}

export const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  update: () => {},
  loading: true,
});
