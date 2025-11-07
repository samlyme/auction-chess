import type { Game, Move } from "boardgame.io";
import { INVALID_MOVE, TurnOrder } from "boardgame.io/core";
import type { Color, NormalMove } from "chessops";
import { PseudoChess } from "./pseudoChess";

export interface Bid {
  amount: number;
  fold: boolean;
}

export interface AuctionState {
  balance: Record<Color, number>;
  bidHistory: Bid[][];
}

export interface ChessState {
  fen: string;
}

export interface AuctionChessState {
  chessState: ChessState;
  auctionState: AuctionState;
}

const movePiece: Move<AuctionChessState> = ({ G, ctx, events }, move: NormalMove) => {
  // Consider a refactor. Recreating the class per move COULD be a bottleneck.
  // TODO: consider turn order
  const chessLogic = new PseudoChess(G.chessState.fen);
  if (!chessLogic.movePiece(move, ctx.currentPlayer as Color)) return INVALID_MOVE;
  G.chessState.fen = chessLogic.toFen();
  // events.setPhase("bid");
};

const makeBid: Move<AuctionChessState> = ({ G, ctx, events }, bid: Bid) => {
  // TODO: consider turn order
  console.log("Trying to bid", bid);

  // TODO: implement bidding

  if (bid.fold) {
    events.setPhase("move");
  }
};

export const AuctionChessGame: Game<AuctionChessState> = {
  setup: () => ({
    chessState: {
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    },
    auctionState: {
      balance: { white: 100, black: 100 },
      bidHistory: [],
    },
  }),

  turn: { 
    minMoves: 1, 
    maxMoves: 1 ,
    order: TurnOrder.CUSTOM(["white", "black"])
  },

  phases: {
    bid: {
      moves: { makeBid },
    },
    move: {
      moves: { movePiece },
      start: true,
    }
  }
};
