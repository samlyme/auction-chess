import type { UseCountdownTimerResult } from "@/hooks/useCountdownTimer";
import { createContext } from "react";
import type { AuctionChessState, Color } from "shared/types/game";
import type { Profile } from "shared/types/profiles";

export interface GameContextType {
  gameState?: AuctionChessState | undefined;
  defaultGameState: AuctionChessState;
  timers: Record<Color, UseCountdownTimerResult>;
  playerColor: Color;
  oppProfile: Profile | null;
  userProfile: Profile;
}
export const GameContext = createContext<GameContextType>({
  gameState: undefined,
  defaultGameState: undefined!,
  timers: undefined!,
  playerColor: "white",
  oppProfile: null,
  userProfile: undefined!,
});
