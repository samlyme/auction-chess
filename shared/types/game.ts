import * as chessops from "chessops";
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

export const PieceValue = z.record(Role, z.number());
export type PieceValue = z.infer<typeof PieceValue>;

export const AuctionState = z.object({
  balance: z.record(Color, z.number()),
  bidHistory: z.array(z.array(Bid)),
  minBid: z.number(),
  interestRate: z.number(),
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
export const SquareSetSchema = z.object({
  lo: z.number().int(), // Use int() for safety
  hi: z.number().int(),
}).transform((data) => new chessops.SquareSet(data.lo, data.hi));

export type SquareSet = chessops.SquareSet;
export type SerializedSquareSet = z.input<typeof SquareSetSchema>;

export const BoardSchema = z.object({
    occupied: SquareSetSchema,
    promoted: SquareSetSchema,
    white: SquareSetSchema,
    black: SquareSetSchema,
    pawn: SquareSetSchema,
    knight: SquareSetSchema,
    bishop: SquareSetSchema,
    rook: SquareSetSchema,
    queen: SquareSetSchema,
    king: SquareSetSchema,
});
export type Board = z.output<typeof BoardSchema>;
export type SerializedBoard = z.input<typeof BoardSchema>;

// ChessState is roughly equivalent to Setup from chessops
export const ChessStateSchema = z.object({
  board: BoardSchema,
  castlingRights: SquareSetSchema,
  epSquare: Square.optional(),
});
export type ChessState = z.output<typeof ChessStateSchema>;
export type SerializedChessState = z.input<typeof ChessStateSchema>;

export const AuctionChessStateSchema = z.object({
    chessState: ChessStateSchema,
    auctionState: AuctionState,
    pieceIncome: PieceValue,
    pieceFee: PieceValue,
    timeState: TimeState.optional(),
    turn: Color,
    phase: Phase,
    outcome: Outcome.optional(),
})

export type AuctionChessState = z.output<typeof AuctionChessStateSchema>;
export type SerialziedAuctionChessState = z.input<typeof AuctionChessStateSchema>;

export const TimeConfig = z.discriminatedUnion("enabled", [
  z.object({ enabled: z.literal(false) }),
  z.object({ enabled: z.literal(true), initTime: z.record(Color, z.number()) }),
]);
export type TimeConfig = z.infer<typeof TimeConfig>;

export const InterestConfig  = z.discriminatedUnion("enabled", [
  z.object({ enabled: z.literal(false) }),
  z.object({ enabled: z.literal(true), rate: z.number() }),
]);
export type InterestConfig = z.infer<typeof InterestConfig>;

export const PieceIncomeConfig = z.discriminatedUnion("enabled", [
  z.object({ enabled: z.literal(false) }),
  z.object({ enabled: z.literal(true), pieceIncome: PieceValue }),
]);
export type PieceIncomeConfig = z.infer<typeof PieceIncomeConfig>;

export const PieceFeeConfig = z.discriminatedUnion("enabled", [
  z.object({ enabled: z.literal(false) }),
  z.object({ enabled: z.literal(true), pieceFee: PieceValue }),
]);
export type PieceFeeConfig = z.infer<typeof PieceFeeConfig>;

export const GameConfig = z.object({
  hostColor: Color,
  timeConfig: TimeConfig,
  interestConfig: InterestConfig,
  pieceIncomeConfig: PieceIncomeConfig,
  pieceFeeConfig: PieceFeeConfig,
});
export type GameConfig = z.infer<typeof GameConfig>;
