import { ROLES, SquareSet, type Color, type Piece, type Role } from "chessops";
import type { Square, Board } from "../types/game";

export function serializeSquareSet(squareSet: SquareSet) {
  return {
    lo: squareSet.lo,
    hi: squareSet.hi,
  };
}

export const defaultBoard: Board = {
  occupied: new SquareSet(0xffff, 0xffff_0000),
  promoted: new SquareSet(0, 0),
  white: new SquareSet(0xffff, 0),
  black: new SquareSet(0, 0xffff_0000),
  pawn: new SquareSet(0xff00, 0x00ff_0000),
  knight: new SquareSet(0x42, 0x4200_0000),
  bishop: new SquareSet(0x24, 0x2400_0000),
  rook: new SquareSet(0x81, 0x8100_0000),
  queen: new SquareSet(0x8, 0x0800_0000),
  king: new SquareSet(0x10, 0x1000_0000),
};

export function getColor(board: Board, square: Square): Color | undefined {
  if (board.white.has(square)) return "white";
  if (board.black.has(square)) return "black";
  return undefined;
}

export function getRole(board: Board, square: Square): Role | undefined {
  for (const role of ROLES) {
    if (board[role].has(square)) return role;
  }
  return undefined;
}

export function getPiece(board: Board, square: Square): Piece | undefined {
  const color = getColor(board, square);
  if (!color) return;
  const role = getRole(board, square)!;
  const promoted = board.promoted.has(square);
  return { color, role, promoted };
}

export function take(board: Board, square: Square): Board {
  const {
    occupied,
    promoted,
    white,
    black,
    pawn,
    knight,
    bishop,
    rook,
    queen,
    king,
  } = board;
  return {
    occupied: occupied.without(square),
    promoted: promoted.without(square),
    white: white.without(square),
    black: black.without(square),
    pawn: pawn.without(square),
    knight: knight.without(square),
    bishop: bishop.without(square),
    rook: rook.without(square),
    queen: queen.without(square),
    king: king.without(square),
  };
}

export function set(board: Board, square: Square, piece: Piece): Board {
  const {
    occupied,
    promoted,
    white,
    black,
    pawn,
    knight,
    bishop,
    rook,
    queen,
    king,
  } = board;
  return {
    occupied: occupied.with(square),
    promoted: piece.promoted ? promoted.with(square) : promoted,

    white: piece.color === "white" ? white.with(square) : white,
    black: piece.color === "black" ? black.with(square) : black,

    pawn: piece.role === "pawn" ? pawn.with(square) : pawn,
    knight: piece.role === "knight" ? knight.with(square) : knight,
    bishop: piece.role === "bishop" ? bishop.with(square) : bishop,
    rook: piece.role === "rook" ? rook.with(square) : rook,
    queen: piece.role === "queen" ? queen.with(square) : queen,
    king: piece.role === "king" ? king.with(square) : king,
  };
}
