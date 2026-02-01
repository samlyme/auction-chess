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

        // NOTE: the default behavior of `makePiece` is to append a '~' in front
        // if the piece has been promoted. This breaks the frontend.
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
  config = structuredClone(config);

  const timeState = config.timeConfig.enabled
    ? {
        time: config.timeConfig.initTime,
        prev: null,
      }
    : undefined;

  return {
    chessState: defaultChessState(),
    timeState,
    auctionState: {
      balance: config.auctionConfig.initBalance,
      bidHistory: [[]],
      minBid: 1,
      interestRate: config.interestConfig.enabled ? config.interestConfig.rate : 0,
    },
    pieceIncome: config.pieceIncomeConfig.enabled ? config.pieceIncomeConfig.pieceIncome : nonePieceValue(),
    pieceFee: config.pieceFeeConfig.enabled ? config.pieceFeeConfig.pieceFee : nonePieceValue(),
    turn: "white",
    phase: "bid",
  };
}
