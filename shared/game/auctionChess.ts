import { opposite } from "chessops";
import { castImmutable, produce } from "immer";
import { PseudoChess } from "./pseudoChess";
import type {
  Bid,
  AuctionChessState,
  NormalMove,
  Result,
  GameConfig,
  Outcome,
} from "../types/index";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const STARTING_BALANCE = 100;

export type GameResult = Result<AuctionChessState, string>;

export function createGame(config: GameConfig): AuctionChessState {
  const timeState = config.timeConfig.enabled
    ? {
        time: { ...config.timeConfig.initTime },
        prev: null,
      }
    : undefined;

  return castImmutable({
    chessState: { fen: STARTING_FEN },
    timeState,
    auctionState: {
      balance: { white: STARTING_BALANCE, black: STARTING_BALANCE },
      bidHistory: [[]],
      minBid: 1,
    },
    turn: "white",
    phase: "bid",
  }); // Cast to satisfy Immutable type
}

// TODO: factor out time logic from these
export function movePiece(
  game: AuctionChessState,
  move: NormalMove,
  usedTime: number,
): GameResult {
  if (game.timeState && usedTime > game.timeState.time[game.turn]) {
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

    if (draft.timeState) {
      draft.timeState.time[draft.turn] -= usedTime;
      draft.timeState.prev = Date.now();
    }

    const opponent = opposite(draft.turn);
    const currentBidStack =
      draft.auctionState.bidHistory[draft.auctionState.bidHistory.length - 1]!;

    // Check if opponent is broke - they automatically fold
    if (draft.auctionState.balance[opponent] === 0) {
      // Push a fold for the broke player
      currentBidStack.push({ fold: true });
      draft.auctionState.bidHistory.push([]);
      draft.auctionState.balance[draft.turn] -= draft.auctionState.minBid;
      draft.phase = "move";
      // turn stays the same
    } else {
      // Normal flow: switch to bid phase
      draft.auctionState.bidHistory.push([]);
      draft.turn = opponent;
      draft.auctionState.minBid = 1; // TODO: define a function for starting minBid based on gameState.
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
  usedTime: number,
): GameResult {
  if (game.timeState && usedTime > game.timeState.time[game.turn]) {
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
  if (!bid.fold) {
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

    if (draft.timeState) {
      draft.timeState.time[draft.turn] -= usedTime;
      draft.timeState.prev = Date.now();
    }

    // Handle fold
    if (bid.fold) {
      if (lastBid && "amount" in lastBid) {
        draft.auctionState.balance[opposite(draft.turn)] -= lastBid.amount;
      }
      currentBidStack.push(bid);
      draft.turn = opposite(draft.turn);
      draft.phase = "move";
      return;
    }

    draft.auctionState.minBid = bid.amount + currentBidStack.length + 1;

    // Handle bid that opponent can't beat
    if (draft.auctionState.minBid > draft.auctionState.balance[opposite(draft.turn)]) {
      draft.auctionState.balance[draft.turn] -= bid.amount;
      currentBidStack.push(bid);
      draft.phase = "move";
      draft.auctionState.minBid = 0; // placeholder because the makeMove function sets the starting bid.
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
  timeUsed: number,
): GameResult {
  if (!gameState.timeState) return { ok: false, error: "Time disabled." };

  const nextState = produce(gameState, (draft) => {
    // NOTE: draft.timeState should always be defined here.
    console.log("timecheck", { timeUsed });
    
    if (draft.timeState && timeUsed >= draft.timeState.time[draft.turn]) {
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

export function getCurrentBidStack(game: AuctionChessState) {
  return game.auctionState.bidHistory[game.auctionState.bidHistory.length - 1]!;
}

export function getLastBid(game: AuctionChessState): Bid | undefined {
  const bidStack = getCurrentBidStack(game);
  return bidStack[bidStack.length - 1];
}
