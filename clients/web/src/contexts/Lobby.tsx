import { createContext } from "react";
// TODO: shared lobby zod schema
import type { Tables } from "shared";

export interface LobbyContextType {
  lobby: Tables<"lobbies"> | null,
  update: (lobby: Tables<"lobbies"> | null) => void;
  loading: boolean,
};

export const LobbyContext = createContext<LobbyContextType>({
  lobby: null,
  update: (_ = null) => {},
  loading: true
});
