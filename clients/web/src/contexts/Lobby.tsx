import type { UseCountdownTimerResult } from "@/hooks/useCountdownTimer";
import { createContext } from "react";
import type { AuctionChessState, Color } from "shared/types/game";
import type { Profile } from "shared/types/profiles";
import type { LobbyPayload } from "shared/types/lobbies";

export interface LobbyContextType {
  gameState?: AuctionChessState | undefined;
  defaultGameState: AuctionChessState;
  prevGameState: AuctionChessState | null;
  timers: Record<Color, UseCountdownTimerResult>;
  playerColor: Color;
  oppProfile: Profile | null;
  userProfile: Profile;
  lobby: LobbyPayload;
  userId: string;
}
export const LobbyContext = createContext<LobbyContextType>({
  gameState: undefined,
  defaultGameState: undefined!,
  prevGameState: null,
  timers: undefined!,
  playerColor: "white",
  oppProfile: null,
  userProfile: undefined!,
  lobby: undefined!,
  userId: undefined!,
});
