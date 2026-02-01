import { SquareSet } from "chessops";
import type { AuctionChessState, Board, ChessState, Color, PieceValue, Square } from "../types/game"
import type { LobbyConfig } from "../types/lobbies";
import { getPiece } from "./boardOps";
import * as PseudoChess from "./pseudoChess";

// These should be factory functions because otherwise its state gets touched
// by the FSM.

export const DEFAULT_TIME_MINUTES = 5;
export const DEFAULT_INTEREST_RATE = 0.05;
export const defaultPieceIncome = (): PieceValue => ({
  "pawn": 1,
  "knight": 3,
  "bishop": 3,
  "rook": 5,
  "queen": 9,
  "king": 11,
});

export const defaultPieceFee = (): PieceValue => ({
  "pawn": 1,
  "knight": 9,
  "bishop": 9,
  "rook": 25,
  "queen": 81,
  "king": 111,
});

export const nonePieceValue = (): PieceValue => ({
  "pawn": 0,
  "knight": 0,
  "bishop": 0,
  "rook": 0,
  "queen": 0,
  "king": 0
});

export const defaultBoard = (): Board => ({
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
});


export const defaultChessState = (): ChessState => ({
  board: defaultBoard(),
  castlingRights: SquareSet.corners(),
  epSquare: undefined,
})

export const defaultLobbyConfig = (): LobbyConfig => ({
  gameConfig: {
    hostColor: "white",
    auctionConfig: {
      initBalance: {
        white: 300,
        black: 300,
      },
    },
    timeConfig: {
      enabled: false,
    },
    interestConfig: {
      enabled: false,
    },
    pieceIncomeConfig: {
      enabled: false,
    },
    pieceFeeConfig: {
      enabled: false,
    },
  },
});

export function legalDests(game: AuctionChessState, from: Square, color: Color) {
  if (game.turn !== color) return SquareSet.empty();

  const piece = getPiece(game.chessState.board, from);
  if (!piece) return SquareSet.empty();

  if (!game.pieceFee) return PseudoChess.legalDests(game.chessState, from);

  if (game.auctionState.balance[color] < game.pieceFee[piece.role]) return SquareSet.empty();

  return PseudoChess.legalDests(game.chessState, from);
}
export function* legalMoves(game: AuctionChessState) {
  if (!game.pieceFee) return PseudoChess.legalMoves(game.chessState, game.turn);

  const {pieceFee, turn, chessState} = game;
  const balance = game.auctionState.balance;

  for (const move of PseudoChess.legalMoves(chessState, turn)) {
    if (pieceFee[getPiece(chessState.board, move.from)!.role] <= balance[game.turn]) {
      yield move;
    }
  }
}
