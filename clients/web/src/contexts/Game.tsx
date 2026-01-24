import type { UseCountdownTimerResult } from "@/hooks/useCountdownTimer";
import { createContext } from "react";
import type { AuctionChessState, Color } from "shared/types/game";

interface GameData {
  gameState: AuctionChessState;
  prevGameState: AuctionChessState | null;
}
type Timers = Record<Color, UseCountdownTimerResult>;

export interface GameContextType {
  gameData: GameData | null;
  timers: Timers | null;
}

export const GameContext = createContext<GameContextType>({
  gameData: null,
  timers: null,
})
