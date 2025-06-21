export type Color = "w" | "b";
export type PieceType = "p" | "r" | "n" | "b" | "q" | "k";

export interface BoardPosition {
  row: number;
  col: number;
}

export interface Move {
  start: BoardPosition;
  end: BoardPosition;
}

export interface Piece {
  type: PieceType;
  color: Color;
  hasMoved: boolean;
}

export type BoardState = (Piece | null)[][];

export interface GamePacket {
  board: BoardState;
}
