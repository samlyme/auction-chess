import { z } from "zod";

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

export const AuctionChessState = z.object({
  chessState: ChessState,
  auctionState: AuctionState,
  turn: Color,
  phase: Phase,
  winner: Color.optional(),
});
export type AuctionChessState = z.infer<typeof AuctionChessState>;

// ============================================================================
// Lobby types
// ============================================================================

export const LobbyConfig = z.object({
  hostColor: Color,
});
export type LobbyConfig = z.infer<typeof LobbyConfig>;

export const Lobby = z.object({
  code: z.string(),
  config: LobbyConfig,
  created_at: z.string(),
  game_state: AuctionChessState.nullable(),
  guest_uid: z.string().nullable(),
  host_uid: z.string(),
  id: z.number(),
});
export type Lobby = z.infer<typeof Lobby>;

export const LobbyPayload = Lobby.omit({ id: true, game_state: true }).extend({ game_started: z.boolean() });
export type LobbyPayload = z.infer<typeof LobbyPayload>;

export const LobbyToPayload = Lobby.transform(({id, game_state, ...rest}: Lobby) => {
  return {
    game_started: !!game_state,
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

// ============================================================================
// Database types
// ============================================================================
export * from "./database.types.ts";
