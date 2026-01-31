import { opposite, type Color, type NormalMove } from "chessops";
import * as PseudoChess from "./pseudoChess";
import type {
  AuctionChessState,
  Bid,
  GameTransient,
  Outcome,
} from "../types/game";
import { getPiece } from "./boardOps";
import { legalMoves } from "./rules";

export interface GameContext {
  game: AuctionChessState;
  log: GameTransient[];
}

export function enterBid(context: GameContext, color: Color) {
  const { game, log } = context;
  log.push({ type: "stateTransfer", name: "enterBid", params: { color } });

  game.phase = "bid";
  game.turn = color;

  const balance = game.auctionState.balance[game.turn];
  // Auto fold!
  if (balance < game.auctionState.minBid) {
    log.push({ type: "autoFold", color: game.turn });
    exitBid(context, { fold: true }, game.turn);
  }
}

// Usually the color passed in is the same as the current state.
// This just makes the logic easier to follow.
export function exitBid(context: GameContext, bid: Bid, color: Color) {
  const { game, log } = context;
  log.push({ type: "stateTransfer", name: "exitBid", params: { color, bid } });
  // Record bid.
  const bidStack = game.auctionState.bidHistory.at(-1)!;
  const lastBid = bidStack.at(-1);
  const lastBidAmount = lastBid && "amount" in lastBid ? lastBid.amount : 0;

  // Validate non-fold bids (bid has "amount" property)
  if (!bid.fold) {
    if (bid.amount <= 0) {
      throw new Error("Bid amount must be positive");
    }
    if (bid.amount <= lastBidAmount) {
      throw new Error("Bid must be higher than previous bid");
    }
    if (bid.amount > game.auctionState.balance[game.turn]) {
      throw new Error("Insufficient balance");
    }
  }

  bidStack.push(bid);
  if (bid.fold) {
    game.auctionState.bidHistory.push([]);
  }
  // update minBid
  game.auctionState.minBid = bid.fold ? 1 : lastBidAmount + bidStack.length + 1; // placeholder!

  if (bid.fold) {
    // deduct bid and move along.
    game.auctionState.balance[opposite(color)] -= lastBidAmount;
    enterMove(context, opposite(color));
  } else {
    enterBid(context, opposite(color));
  }
}

export function enterMove(context: GameContext, color: Color) {
  const { game, log } = context;
  log.push({ type: "stateTransfer", name: "enterMove", params: { color } });

  game.turn = color;
  const moves = [...legalMoves(game)];

  if (moves.length > 0) {
    game.phase = "move";
  } else {
    enterOutcome(context, { winner: opposite(color), message: "mate" });
  }
}

export function exitMove(context: GameContext, move: NormalMove, color: Color) {
  const { game, log } = context;
  log.push({ type: "stateTransfer", name: "exitMove" });

  const piece = getPiece(game.chessState.board, move.from);

  if (!piece) throw new Error("Move from empty square.");
  if (game.turn !== piece.color)
    throw new Error("Can't move opponent's pieces.");
  if (
    game.pieceFee &&
    game.auctionState.balance[game.turn] < game.pieceFee[piece.role]
  ) {
    throw new Error("Piece too expensive to move.");
  }

  const res = PseudoChess.movePiece(game.chessState, move);
  if (!res.ok) throw new Error(res.error);

  // TODO: implement capture bounty.
  const { moved, taken } = res.value;
  // pay fee.
  if (game.pieceFee) {
    log.push({
      type: "deductFee",
      amounts: {
        [moved.color]: game.pieceFee[moved.role],
        [opposite(moved.color)]: 0,
      } as Record<Color, number>,
    });
    game.auctionState.balance[game.turn] -= game.pieceFee[moved.role];
  }

  const board = game.chessState.board;
  if (!board.king.moreThanOne()) {
    // You captured the king! you win!
    enterOutcome(context, { winner: game.turn, message: "mate" });
  } else {
    // normal move. carry along.
    // earn interest!
    const interestRate = game.auctionState.interestRate;
    if (interestRate > 0) {
      const balances = game.auctionState.balance;
      const amounts = {
        white: Math.floor(balances.white * interestRate),
        black: Math.floor(balances.black * interestRate),
      };
      log.push({
        type: "earnInterest",
        amounts,
      });
      balances.white += amounts.white;
      balances.black += amounts.black;
    }

    // earn income!
    const values = game.pieceIncome;
    if (values) {
      const amounts = {
        white: 0,
        black: 0,
      };
      const board = game.chessState.board;
      const balances = game.auctionState.balance;
      for (const square of board.occupied) {
        const piece = getPiece(board, square)!;
        amounts[piece.color] += values[piece.role];
      }

      log.push({ type: "addIncome", amounts });
      balances.white += amounts.white;
      balances.black += amounts.black;
    }
    enterBid(context, opposite(color));
  }
}

export function deductTime(context: GameContext, timeUsed: number): void {
  const { game, log } = context;
  log.push({ type: "stateTransfer", name: "deductTime", params: { timeUsed } });
  if (!game.timeState) return;

  game.timeState.time[game.turn] -= timeUsed;

  if (game.timeState.time[game.turn] >= 0) {
    game.timeState.prev = Date.now();
  } else {
    game.timeState.time[game.turn] = 0;
    game.timeState.prev = null;

    enterOutcome(context, {
      winner: opposite(game.turn),
      message: "timeout",
    });
  }
}

export function timecheck(context: GameContext, timeUsed: number): void {
  const { game, log } = context;
  log.push({ type: "stateTransfer", name: "timecheck" });
  if (!game.timeState) return;

  if (game.timeState && timeUsed >= game.timeState.time[game.turn]) {
    game.timeState.prev = null;
    game.timeState.time[game.turn] = 0;

    enterOutcome(context, {
      winner: game.turn === "white" ? "black" : "white",
      message: "timeout",
    });
  }
}

export function enterOutcome(context: GameContext, outcome: Outcome) {
  const { game, log } = context;
  log.push({
    type: "stateTransfer",
    name: "enterOutcome",
    params: { outcome },
  });
  game.outcome = outcome;
}
