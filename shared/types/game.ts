import { SquareSet } from "chessops";
import type { Immutable } from "immer";
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

export const Square = z.int().min(0).max(63);
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
export const Bid = z.discriminatedUnion("fold", [
  z.object({
    amount: z.number(),
    fold: z.literal(false),
  }),
  z.object({
    fold: z.literal(true),
  }),
]);
export type Bid = z.infer<typeof Bid>;

export const AuctionState = z.object({
  balance: z.record(Color, z.number()),
  bidHistory: z.array(z.array(Bid)),
  minBid: z.number(),
});
export type AuctionState = z.infer<typeof AuctionState>;

export const TimeState = z.object({
  time: z.record(Color, z.number()),
  prev: z.number().nullable(),
});
export type TimeState = z.infer<typeof TimeState>;

export const OutcomeMessage = z.enum([
  "mate",
  "ff",
  "stalemate",
  "draw",
  "timeout",
]);
export type OutcomeMessage = z.infer<typeof OutcomeMessage>;

export const Outcome = z.object({
  winner: Color.nullable(),
  message: OutcomeMessage,
});
export type Outcome = z.infer<typeof Outcome>;

// ============================================================================
// Auction Chess Game Logic types
// ============================================================================

export const SerializedSquareSet = z.uint64();
export type SerializedSquareSet = z.infer<typeof SerializedSquareSet>;

const createBoardSchema = <T extends z.ZodType>(squareSetType: T) => {
  return z.object({
    occupied: squareSetType,
    promoted: squareSetType,
    white: squareSetType,
    black: squareSetType,
    pawn: squareSetType,
    knight: squareSetType,
    bishop: squareSetType,
    rook: squareSetType,
    queen: squareSetType,
    king: squareSetType,
  });
};
export const Board = createBoardSchema(z.instanceof(SquareSet));
export type Board = Immutable<z.infer<typeof Board>>;
export const SerializedBoard = createBoardSchema(SerializedSquareSet);
export type SerializedBoard = z.infer<typeof SerializedBoard>;

const createChessStateSchema = <T extends z.ZodType>(squareSetType: T) => {
  return z.object({
    board: createBoardSchema(squareSetType),
    castlingRights: squareSetType,
    epSquare: Square.optional(),
  })
}
// ChessState is roughly equivalent to Setup from chessops
export const ChessState = createChessStateSchema(z.instanceof(SquareSet));
export type ChessState = Immutable<z.infer<typeof ChessState>>;
export const SerializedChessState = createChessStateSchema(SerializedSquareSet);
export type SerializedChessState = Immutable<z.infer<typeof SerializedChessState>>;

const createAuctionChessStateSchema = <T extends z.ZodType>(squareSetType: T) => {
  return z.object({
    chessState: createChessStateSchema(squareSetType),
    auctionState: AuctionState,
    timeState: TimeState.optional(),
    turn: Color,
    phase: Phase,
    outcome: Outcome.optional(),
  })
}
export const AuctionChessState = createAuctionChessStateSchema(z.instanceof(SquareSet));
export type AuctionChessState = Immutable<z.infer<typeof AuctionChessState>>;
export const SerialziedAuctionChessState = createAuctionChessStateSchema(SerializedSquareSet);
export type SerialziedAuctionChessState = Immutable<z.infer<typeof SerialziedAuctionChessState>>;

export const TimeConfig = z.discriminatedUnion("enabled", [
  z.object({ enabled: z.literal(false) }),
  z.object({ enabled: z.literal(true), initTime: z.record(Color, z.number()) }),
]);
export type TimeConfig = z.infer<typeof TimeConfig>;

export const GameConfig = z.object({
  hostColor: Color,
  timeConfig: TimeConfig,
});
export type GameConfig = z.infer<typeof GameConfig>;
