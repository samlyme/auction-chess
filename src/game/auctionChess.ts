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

const movePiece: Move<AuctionChessState> = (
  { G, ctx, events },
  move: NormalMove
) => {
  const { balance, bidHistory } = G.auctionState;
  const bidStack: Bid[] = bidHistory[bidHistory.length - 1]!;
  // Consider a refactor. Recreating the class per move COULD be a bottleneck.
  // TODO: consider turn order
  const chessLogic = new PseudoChess(G.chessState.fen);
  if (!chessLogic.movePiece(move, ctx.currentPlayer as Color))
    return INVALID_MOVE;
  G.chessState.fen = chessLogic.toFen();

  if (balance.white == 0 || balance.black == 0) {
    console.log("skip bid phase");
    const brokePlayer = balance.white === 0 ? "white" : "black";
    const richPlayer = opposite(brokePlayer)
    balance[richPlayer] -= 1;
    bidStack.push({
      amount: 1,
      fold: false,
      from: richPlayer
    });
    bidHistory.push([]);
    events.endTurn({ next: richPlayer });
    events.setPhase("move");
    return;
  }

  if (balance[opposite(ctx.currentPlayer as Color)] > 0) {
    
    events.endTurn({ next: opposite(ctx.currentPlayer as Color) });
    events.setPhase("bid");
    return;
  }
};

const makeBid: Move<AuctionChessState> = ({ G, ctx, events }, bid: Bid) => {
  // TODO: consider turn order
  console.log("Trying to bid", bid);
  const { balance, bidHistory } = G.auctionState;
  const bidStack: Bid[] = bidHistory[bidHistory.length - 1]!;
  const lastBid = bidStack[bidStack.length - 1];
  const lastBidAmount: number = lastBid ? lastBid.amount : 0;

  if (
    !bid.fold &&
    (bid.amount <= 0 ||
      bid.amount <= lastBidAmount ||
      bid.amount > balance[bid.from])
  ) {
    return INVALID_MOVE;
  }

  if (bid.fold) {
    if (lastBid) {
      balance[lastBid.from] -= lastBid.amount;
    }
    bidStack.push(bid);
    bidHistory.push([]);
    events.endTurn({ next: opposite(ctx.currentPlayer as Color) });
    events.setPhase("move");
    return;
  }

  if (bid.amount >= balance[opposite(bid.from)]) {
    balance[bid.from] -= bid.amount;
    bidStack.push(bid);
    bidHistory.push([]);
    events.setPhase("move");
    return;
  }

  events.endTurn({ next: opposite(ctx.currentPlayer as Color) });
  bidStack.push(bid);
};

export const AuctionChessGame: Game<AuctionChessState> = {
  setup: () => ({
    chessState: {
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    },
    auctionState: {
      balance: { white: 1000, black: 1000 },
      bidHistory: [[]],
    },
  }),

  turn: {
    order: TurnOrder.CUSTOM(["white", "black"]),
  },

  phases: {
    bid: {
      moves: { makeBid },
      turn: {
        order: {
          playOrder: () => ["white", "black"],
          first: ({ ctx }) => ctx.playOrderPos,
          next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
        },
      },
      start: true,
    },
    move: {
      moves: { movePiece },
      turn: {
        order: {
          playOrder: () => ["white", "black"],
          first: ({ ctx }) => ctx.playOrderPos,
          next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
        },
      },
    },
  },
};
