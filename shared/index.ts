import { z } from "zod";
import type { Immutable } from "immer";

// ============================================================================
// Chess types (from chessops)
// ============================================================================

export const Role = z.enum([
  "pawn",
  "knight",
  "bishop",
  "rook",
  "queen",
  "king",
]);
export type Role = z.infer<typeof Role>;

export const Square = z.number().int().min(0).max(63);
export type Square = z.infer<typeof Square>;

export const NormalMove = z.object({
  from: Square,
  to: Square,
  promotion: Role.optional(),
});
export type NormalMove = z.infer<typeof NormalMove>;

export const Color = z.enum(["white", "black"]);
export type Color = z.infer<typeof Color>;

// ============================================================================
// Auction Chess Game types
// ============================================================================

export const Phase = z.enum(["bid", "move"]);
export type Phase = z.infer<typeof Phase>;

// "from" field should not exist here. Not the responsibility of the game
// logic to validate the source of moves.
export const Bid = z.union([
  z.object({
    amount: z.number(),
  }),
  z.object({
    fold: z.boolean()
  })
]);
export type Bid = z.infer<typeof Bid>;

export const AuctionState = z.object({
  balance: z.record(Color, z.number()),
  bidHistory: z.array(z.array(Bid)),
});
export type AuctionState = z.infer<typeof AuctionState>;

export const ChessState = z.object({
  fen: z.string(),
});
export type ChessState = z.infer<typeof ChessState>;

export const TimeState = z.object({
  time: z.record(Color, z.number()),
  prev: z.number().nullable(),
});
export type TimeState = z.infer<typeof TimeState>;

export const OutcomeMessage = z.enum(["mate", "ff", "stalemate", "draw", "timeout"]);
export type OutcomeMessage = z.infer<typeof OutcomeMessage>;

export const Outcome = z.object({
  winner: Color.nullable(),
  message: OutcomeMessage,
})
export type Outcome = z.infer<typeof Outcome>;

export const AuctionChessState = z.object({
  chessState: ChessState,
  auctionState: AuctionState,
  timeState: TimeState,
  turn: Color,
  phase: Phase,
  outcome: Outcome.optional(),
});
// Game state is immutable - only modified via Immer's produce()
export type AuctionChessState = Immutable<z.infer<typeof AuctionChessState>>;

export const GameConfig = z.object({
  hostColor: Color,
  initTime: z.record(Color, z.number()),
})
export type GameConfig = z.infer<typeof GameConfig>;

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
// Override inferred type to use immutable AuctionChessState
// Type magic to express that Lobby is mutable, but AuctionChessState is not.
export type Lobby = Omit<z.infer<typeof Lobby>, 'gameState'> & {
  gameState: AuctionChessState | null;
};

export const LobbyPayload = Lobby.omit({ id: true, gameState: true }).extend({ gameStarted: z.boolean() });
export type LobbyPayload = z.infer<typeof LobbyPayload>;

export const LobbyToPayload = Lobby.transform(({id, gameState, ...rest}: Lobby) => {
  return {
    gameStarted: !!gameState,
    ...rest
  };
}).pipe(LobbyPayload)

export const LobbyJoinQuery = z.object({
  code: z.string(),
});
export type LobbyJoin = z.infer<typeof LobbyJoinQuery>;

// ============================================================================
// Profile types
// ============================================================================

export const Profile = z.object({
  bio: z.string(),
  // stop messing with DB naming conventions lol. Just leave it, it's not worth.
  created_at: z.string(),
  id: z.string(),
  username: z.string(),
});
export type Profile = z.infer<typeof Profile>;

export const ProfileCreate = z
  .object({
    id: z.string(),
    username: z.string(),
    bio: z.string(),
  })
  .strict();
export type ProfileCreate = z.infer<typeof ProfileCreate>;

export const ProfileUpdate = z
  .object({
    bio: z.string(),
  })
  .strict();
export type ProfileUpdate = z.infer<typeof ProfileUpdate>;

// ============================================================================
// API types
// ============================================================================

export const LobbyEventType = {
  LobbyUpdate: "lobby-update",
  LobbyDelete: "lobby-delete",
  GameUpdate: "game-update"
} as const;

export type LobbyEventType = typeof LobbyEventType[keyof typeof LobbyEventType];

export const HTTPException = z.object({
  message: z.string().optional(),
});
export type HTTPException = z.infer<typeof HTTPException>;

export const APIError = z.object({
  status: z.number(),
  message: z.string(),
});
export type APIError = z.infer<typeof APIError>;

// Result type for API responses
export type Result<T, E = APIError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Helper functions for creating Results
export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// Helper to match on Result types
export function match<T, E, R>(
  result: Result<T, E>,
  handlers: {
    ok: (value: T) => R;
    err: (error: E) => R;
  },
): R {
  return result.ok ? handlers.ok(result.value) : handlers.err(result.error);
}
