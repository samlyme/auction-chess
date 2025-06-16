import type {
  Piece,
  Color,
  PieceType,
  BoardPosition,
  BoardState,
} from "./types";

class CustomChessEngine {
  private board: BoardState;

  constructor() {
    this.board = this.initializeBoard();
  }

  private initializeBoard(): BoardState {
    const board: BoardState = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    board[0][0] = { type: "rook", color: "white", hasMoved: false };
    board[0][1] = { type: "nknight", color: "white", hasMoved: false };
    board[0][4] = { type: "king", color: "white", hasMoved: false };
    board[0][7] = { type: "rook", color: "white", hasMoved: false };
    for (let i = 0; i < 8; i++) {
      board[1][i] = { type: "pawn", color: "white", hasMoved: false };
      board[6][i] = { type: "pawn", color: "black", hasMoved: false };
    }
    board[7][0] = { type: "rook", color: "black", hasMoved: false };
    board[7][1] = { type: "nknight", color: "black", hasMoved: false };
    board[7][4] = { type: "king", color: "black", hasMoved: false };
    board[7][7] = { type: "rook", color: "black", hasMoved: false };

    return board;
  }
}
