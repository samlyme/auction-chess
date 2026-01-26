import { makePiece } from "chessops/fen";
import {getPiece,} from "./boardOps"
import type { AuctionChessState, Board, GameConfig } from "../types/game";
import { bishopAttacks, kingAttacks, knightAttacks, opposite, pawnAttacks, rookAttacks, type Color, type Square, type SquareSet } from "chessops";
import { nonePieceValue, defaultChessState } from "./rules";

// Need to copy code here because of type mismatch. Board !== PureBoard.
export const makeBoardFen = (board: Board): string => {
  let fen = '';
  let empty = 0;
  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      const square = file + rank * 8;
      const piece = getPiece(board, square);
      if (!piece) empty++;
      else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        fen += makePiece(piece);
      }

      if (file === 7) {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        if (rank !== 0) fen += '/';
      }
    }
  }
  return fen;
};

export function attacksTo(
  square: Square,
  attacker: Color,
  board: Board,
): SquareSet {
  const occupied = board.occupied;
  return board[attacker].intersect(
    rookAttacks(square, occupied)
      .intersect(board.queen.union(board.rook))
      .union(
        bishopAttacks(square, occupied).intersect(
          board.queen.union(board.bishop),
        ),
      )
      .union(knightAttacks(square).intersect(board.knight))
      .union(kingAttacks(square).intersect(board.king))
      .union(pawnAttacks(opposite(attacker), square).intersect(board.pawn)),
  );
}

export function createGame(config: GameConfig): AuctionChessState {
  const cloned = structuredClone(config);
  const timeState = cloned.timeConfig.enabled
    ? {
        time: cloned.timeConfig.initTime,
        prev: null,
      }
    : undefined;

  return {
    chessState: defaultChessState,
    timeState,
    auctionState: {
      balance: {...cloned.auctionConfig.initBalance},
      bidHistory: [[]],
      minBid: 1,
      interestRate: cloned.interestConfig.enabled ? cloned.interestConfig.rate : 0,
    },
    pieceIncome: cloned.pieceIncomeConfig.enabled ? cloned.pieceIncomeConfig.pieceIncome : structuredClone(nonePieceValue),
    pieceFee: cloned.pieceFeeConfig.enabled ? cloned.pieceFeeConfig.pieceFee : structuredClone(nonePieceValue),
    turn: "white",
    phase: "bid",
  };
}
