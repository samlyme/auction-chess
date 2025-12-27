import { opposite } from "chessops";
import { PseudoChess } from "./pseudoChess";
import type {
  Bid,
  AuctionChessState,
  NormalMove,
  Result,
  GameConfig,
  Outcome,
} from "../index";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const STARTING_BALANCE = 1000;

export type GameResult = Result<AuctionChessState, string>;

export function createGame(config: GameConfig): AuctionChessState {
  return {
    chessState: { fen: STARTING_FEN },
    timeState: {
      time: config.initTime,
      prev: null,
    },
    auctionState: {
      balance: { white: STARTING_BALANCE, black: STARTING_BALANCE },
      bidHistory: [[]],
    },
    turn: "white",
    phase: "bid",
  };
}

export function movePiece(
  game: AuctionChessState,
  move: NormalMove,
  usedTime: number,
): GameResult {
  if (usedTime >= game.timeState.time[game.turn]) {
    // This should genuinely never happen.
    return { ok: false, error: "Move came after timeout." }
  }

  if (game.phase !== "move") {
    return { ok: false, error: "Not in move phase" };
  }

  const chess = new PseudoChess(game.chessState.fen);
  if (!chess.movePiece(move, game.turn)) {
    return { ok: false, error: "Invalid move" };
  }

  const newFen = chess.toFen();
  const chessOutcome = chess.outcome();
  const outcome: Outcome | undefined = chessOutcome.winner ? {
    winner: chessOutcome.winner,
    message: "mate",
  } : undefined;
  const { balance, bidHistory } = game.auctionState;
  const currentBidStack = bidHistory[bidHistory.length - 1]!;

  const newTime = game.timeState;
  newTime.time[game.turn] -= usedTime;
  newTime.prev = Date.now();

  // Check if opponent is broke - they automatically fold
  const opponent = opposite(game.turn);
  if (balance[opponent] === 0) {
    // Push a fold for the broke player
    currentBidStack.push({ fold: true });
    bidHistory.push([]);

    return {
      ok: true,
      value: {
        chessState: { fen: newFen },
        auctionState: { balance, bidHistory },
        timeState: newTime,
        turn: game.turn,
        phase: "move",
        outcome
      },
    };
  }

  // Normal flow: switch to bid phase
  const nextPlayer = opposite(game.turn);
  bidHistory.push([]);

  return {
    ok: true,
    value: {
      chessState: { fen: newFen },
      auctionState: { balance, bidHistory },
      timeState: newTime,
      turn: nextPlayer,
      phase: "bid",
      outcome
    },
  };
}

export function makeBid(game: AuctionChessState, bid: Bid, usedTime: number): GameResult {
  if (usedTime >= game.timeState.time[game.turn]) {
    // This should genuinely never happen.
    return { ok: false, error: "Move came after timeout." }
  }

  if (game.phase !== "bid") {
    return { ok: false, error: "Not in bid phase" };
  }

  const { balance, bidHistory } = game.auctionState;
  const bidStack = bidHistory[bidHistory.length - 1]!;
  const lastBid = bidStack[bidStack.length - 1];

  // Get last bid amount, considering it might be a fold
  const lastBidAmount = lastBid && "amount" in lastBid ? lastBid.amount : 0;

  const newTime = game.timeState;
  newTime.time[game.turn] -= usedTime;
  newTime.prev = Date.now();
  // Handle fold
  if ("fold" in bid) {
    if (lastBid && "amount" in lastBid) {
      balance[opposite(game.turn)] -= lastBid.amount;
    }
    bidStack.push(bid);

    return {
      ok: true,
      value: {
        chessState: game.chessState,
        auctionState: { balance, bidHistory },
        timeState: newTime,
        turn: opposite(game.turn),
        phase: "move",
      },
    };
  }

  // Validate non-fold bids (bid has "amount" property)
  if (bid.amount <= 0) {
    return { ok: false, error: "Bid amount must be positive" };
  }
  if (bid.amount <= lastBidAmount) {
    return { ok: false, error: "Bid must be higher than previous bid" };
  }
  if (bid.amount > balance[game.turn]) {
    return { ok: false, error: "Insufficient balance" };
  }

  // Handle bid that opponent can't beat
  if (bid.amount >= balance[opposite(game.turn)]) {
    balance[game.turn] -= bid.amount;
    bidStack.push(bid);

    return {
      ok: true,
      value: {
        chessState: game.chessState,
        auctionState: { balance, bidHistory },
        timeState: newTime,
        turn: game.turn,
        phase: "move",
      },
    };
  }

  // Normal bid: continue bidding
  bidStack.push(bid);

  return {
    ok: true,
    value: {
      ...game,
      auctionState: { balance, bidHistory },
      turn: opposite(game.turn),
    },
  };
}

export function getCurrentBidStack(game: AuctionChessState): Bid[] {
  return game.auctionState.bidHistory[game.auctionState.bidHistory.length - 1]!;
}

export function getLastBid(game: AuctionChessState): Bid | undefined {
  const bidStack = getCurrentBidStack(game);
  return bidStack[bidStack.length - 1];
}
