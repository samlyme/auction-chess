import type { UseCountdownTimerResult } from "@/hooks/useCountdownTimer";
import { createContext } from "react";
import type { AuctionChessState, Color } from "shared/types/game";
import type { LobbyPayload } from "shared/types/lobbies";

export type LobbyContextType = {
  lobby: LobbyPayload;
  playerColor: Color;
  isHost: boolean;
};

export const LobbyContext = createContext<LobbyContextType>({
  lobby: undefined!,
  playerColor: "white",
  isHost: true,
});
