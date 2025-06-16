export type Color = "white" | "black";
export type PieceType =
  | "pawn"
  | "rook"
  | "nknight"
  | "bishop"
  | "queen"
  | "king";

export interface BoardPosition {
  row: number; // 0-7
  col: number; // 0-7
}

export interface Piece {
  type: PieceType;
  color: Color;
  hasMoved: boolean; // Useful for castling, initial pawn moves
  // Add other properties specific to your pieces if needed
}

export type BoardState = (Piece | null)[][];
