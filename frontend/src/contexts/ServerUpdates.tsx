import { createContext } from "react";
import type { GameData, LobbyProfile } from "../schemas/types";

// TODO: Refactor this to just be the gamepacket or null type
export interface ServerUpdatesContextType {
  lobby: LobbyProfile | null;

  game: GameData | null;
}

export const ServerUpdatesContext =
  createContext<ServerUpdatesContextType | null>(null);
