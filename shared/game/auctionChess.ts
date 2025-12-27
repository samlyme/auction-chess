import { opposite } from "chessops";
import { produce } from "immer";
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
      time: { ...config.initTime }, // if this is not deep copied, strange things happen.
      prev: null,
    },
    auctionState: {
      balance: { white: STARTING_BALANCE, black: STARTING_BALANCE },
      bidHistory: [[]],
    },
    turn: "white",
    phase: "bid",
  } as AuctionChessState; // Cast to satisfy Immutable type
}

export function movePiece(
  game: AuctionChessState,
  move: NormalMove,
  receivedTime: number,
): GameResult {
  const usedTime = timeUsed(game, receivedTime);
  if (usedTime >= game.timeState.time[game.turn]) {
    // This should genuinely never happen.
    return { ok: false, error: "Move came after timeout." };
  }

  if (game.phase !== "move") {
    return { ok: false, error: "Not in move phase" };
  }

  // NOTE: Source of potential perf bottleneck. This code here can "thrash" in
  // high move volume situations. Ie. allocate and deallocate a lot of PseudoChess
  // objects.
  const chess = new PseudoChess(game.chessState.fen);
  if (!chess.movePiece(move, game.turn)) {
    return { ok: false, error: "Invalid move" };
  }

  const newFen = chess.toFen();
  const chessOutcome = chess.outcome();
  const outcome: Outcome | undefined = chessOutcome.winner
    ? {
        winner: chessOutcome.winner,
        message: "mate",
      }
    : undefined;

  const nextState = produce(game, (draft) => {
    draft.chessState.fen = newFen;
    draft.timeState.time[draft.turn] -= usedTime;
    draft.timeState.prev = Date.now();

    const opponent = opposite(draft.turn);
    const currentBidStack =
      draft.auctionState.bidHistory[draft.auctionState.bidHistory.length - 1]!;

    // Check if opponent is broke - they automatically fold
    if (draft.auctionState.balance[opponent] === 0) {
      // Push a fold for the broke player
      currentBidStack.push({ fold: true });
      draft.auctionState.bidHistory.push([]);
      draft.phase = "move";
      // turn stays the same
    } else {
      // Normal flow: switch to bid phase
      draft.auctionState.bidHistory.push([]);
      draft.turn = opponent;
      draft.phase = "bid";
    }

    if (outcome) {
      draft.outcome = outcome;
    }
  });

  return {
    ok: true,
    value: nextState,
  };
}

export function makeBid(
  game: AuctionChessState,
  bid: Bid,
  receivedTime: number,
): GameResult {
  const usedTime = timeUsed(game, receivedTime);

  if (usedTime >= game.timeState.time[game.turn]) {
    // This should genuinely never happen.
    return { ok: false, error: "Move came after timeout." };
  }

  if (game.phase !== "bid") {
    return { ok: false, error: "Not in bid phase" };
  }

  const bidStack =
    game.auctionState.bidHistory[game.auctionState.bidHistory.length - 1]!;
  const lastBid = bidStack[bidStack.length - 1];

  // Get last bid amount, considering it might be a fold
  const lastBidAmount = lastBid && "amount" in lastBid ? lastBid.amount : 0;

  // Validate non-fold bids (bid has "amount" property)
  if ("amount" in bid) {
    if (bid.amount <= 0) {
      return { ok: false, error: "Bid amount must be positive" };
    }
    if (bid.amount <= lastBidAmount) {
      return { ok: false, error: "Bid must be higher than previous bid" };
    }
    if (bid.amount > game.auctionState.balance[game.turn]) {
      return { ok: false, error: "Insufficient balance" };
    }
  }

  const nextState = produce(game, (draft) => {
    const currentBidStack =
      draft.auctionState.bidHistory[draft.auctionState.bidHistory.length - 1]!;

    draft.timeState.time[draft.turn] -= usedTime;
    draft.timeState.prev = Date.now();

    // Handle fold
    if ("fold" in bid) {
      if (lastBid && "amount" in lastBid) {
        draft.auctionState.balance[opposite(draft.turn)] -= lastBid.amount;
      }
      currentBidStack.push(bid);
      draft.turn = opposite(draft.turn);
      draft.phase = "move";
      return;
    }

    // Handle bid that opponent can't beat
    if (bid.amount >= draft.auctionState.balance[opposite(draft.turn)]) {
      draft.auctionState.balance[draft.turn] -= bid.amount;
      currentBidStack.push(bid);
      draft.phase = "move";
      // turn stays the same
      return;
    }

    // Normal bid: continue bidding
    currentBidStack.push(bid);
    draft.turn = opposite(draft.turn);
  });

  return {
    ok: true,
    value: nextState,
  };
}

export function timecheck(
  gameState: AuctionChessState,
  receivedTime: number,
): GameResult {
  const usedTime =
    gameState.timeState.prev === null
      ? 0
      : receivedTime - gameState.timeState.prev;

  const nextState = produce(gameState, (draft) => {
    if (usedTime >= draft.timeState.time[draft.turn]) {
      // TODO: make a helper function for this
      draft.timeState.prev = null;
      draft.timeState.time[draft.turn] = 0;
      draft.outcome = {
        winner: draft.turn === "white" ? "black" : "white",
        message: "timeout",
      };
    }
  });

  return { ok: true, value: nextState };
}

function timeUsed(gameState: AuctionChessState, receivedTime: number): number {
  return gameState.timeState.prev === null
    ? 0
    : receivedTime - gameState.timeState.prev;
}

export function getCurrentBidStack(game: AuctionChessState) {
  return game.auctionState.bidHistory[game.auctionState.bidHistory.length - 1]!;
}

export function getLastBid(game: AuctionChessState): Bid | undefined {
  const bidStack = getCurrentBidStack(game);
  return bidStack[bidStack.length - 1];
}
