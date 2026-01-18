
import { z } from "zod";
import { AuctionChessState, GameConfig } from "./game";

// ============================================================================
// Lobby types
// ============================================================================

export const LobbyConfig = z.object({
  gameConfig: GameConfig,
});
export type LobbyConfig = z.infer<typeof LobbyConfig>;

export const Lobby = z.object({
  code: z.string(),
  config: LobbyConfig,
  createdAt: z.string(),
  gameState: AuctionChessState.nullable(),
  // TODO: implement game history.
  // gameStateHistory: z.array(AuctionChessState),
  guestUid: z.string().nullable(),
  hostUid: z.string(),
  id: z.string(),
});
export type Lobby = z.infer<typeof Lobby>;

export const LobbyPayload = Lobby.omit({ id: true, gameState: true }).extend({
  gameStarted: z.boolean(),
});
export type LobbyPayload = z.infer<typeof LobbyPayload>;

export const LobbyToPayload = Lobby.transform(
  ({ id, gameState, ...rest }: Lobby) => {
    return {
      gameStarted: !!gameState,
      ...rest,
    };
  },
).pipe(LobbyPayload);

export const LobbyJoinQuery = z.object({
  code: z.string(),
});
export type LobbyJoinQuery = z.infer<typeof LobbyJoinQuery>;

export const LobbyEventType = {
  LobbyUpdate: "lobby-update",
  LobbyDelete: "lobby-delete",
  GameUpdate: "game-update",
} as const;

export type LobbyEventType =
  (typeof LobbyEventType)[keyof typeof LobbyEventType];
