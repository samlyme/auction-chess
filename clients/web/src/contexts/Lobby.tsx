import type { UseCountdownTimerResult } from "@/hooks/useCountdownTimer";
import { createContext } from "react";
import type { AuctionChessState, Color } from "shared/types/game";
import type { LobbyPayload } from "shared/types/lobbies";

interface GameData {
  gameState: AuctionChessState;
  prevGameState: AuctionChessState | null;
}
type Timers = Record<Color, UseCountdownTimerResult>;

type GameFeature =
  | {
      lobby: LobbyPayload & { gameStarted: true }; // Narrowing
      game: GameData;
    }
  | {
      lobby: LobbyPayload & { gameStarted: false };
      game?: undefined;
    };

type TimerFeature =
  | {
      // We narrow the deep nested property
      lobby: LobbyPayload & {
        config: { gameConfig: { timeConfig: { enabled: true } } };
      };
      timers: Timers;
    }
  | {
      lobby: LobbyPayload & {
        config: { gameConfig: { timeConfig: { enabled: false } } };
      };
      timers?: undefined;
    };

export type LobbyContextType = {
  lobby: LobbyPayload;
  playerColor: Color;
  isHost: boolean;
} & GameFeature &
  TimerFeature;

export const LobbyContext = createContext<LobbyContextType>({
  lobby: undefined!,
  playerColor: "white",
  isHost: true,
});
