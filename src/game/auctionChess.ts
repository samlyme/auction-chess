import type { Game, Move } from "boardgame.io";
import { INVALID_MOVE, TurnOrder } from "boardgame.io/core";
import { opposite, type Color, type NormalMove } from "chessops";
import { PseudoChess } from "./pseudoChess";

export interface Bid {
  amount: number;
  fold: boolean;
  from: Color;
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
  events.endTurn({ next: opposite(ctx.currentPlayer as Color)})
  events.setPhase("bid");
};

const makeBid: Move<AuctionChessState> = ({ G, ctx, events }, bid: Bid) => {
  // TODO: consider turn order
  console.log("Trying to bid", bid);
  const {balance, bidHistory} = G.auctionState;

  // TODO: implement bidding
  const bidStack: Bid[] = bidHistory[bidHistory.length-1]!;
  const lastBid = bidStack[bidStack.length - 1];

  events.endTurn({ next: opposite(ctx.currentPlayer as Color)})
  if (bid.fold) {
    if (lastBid) {
      balance[lastBid.from] -= lastBid.amount;
    }
    bidHistory.push([])
    events.setPhase("move");
  }
  bidStack.push(bid);
};

export const AuctionChessGame: Game<AuctionChessState> = {
  setup: () => ({
    chessState: {
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    },
    auctionState: {
      balance: { white: 100, black: 100 },
      bidHistory: [[]],
    },
  }),

  turn: { 
    order: TurnOrder.CUSTOM(["white", "black"])
  },

  phases: {
    bid: {
      moves: { makeBid },
      turn: {
        order: {
          playOrder: () => ["white", "black"],
          first: ({ctx}) => ctx.playOrderPos,
          next: ({ctx}) => (ctx.playOrderPos + 1) % ctx.playOrder.length
        }
      },
      start: true,
    },
    move: {
      moves: { movePiece },
      turn: {
        order: {
          playOrder: () => ["white", "black"],
          first: ({ctx}) => ctx.playOrderPos,
          next: ({ctx}) => (ctx.playOrderPos + 1) % ctx.playOrder.length
        }
      },
    }
  }
};
