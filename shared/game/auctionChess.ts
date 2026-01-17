import { opposite } from "chessops";
import { castImmutable, produce } from "immer";
import { PseudoChess } from "./pseudoChess";
import {
  Bid,
  type AuctionChessState,
  type NormalMove,
  type Result,
  type GameConfig,
  type Outcome,
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
): GameResult {
  if (game.outcome) return { ok: false, error: "Game already over." };

  if (game.phase !== "move") return { ok: false, error: "Not in move phase" };

  // NOTE: Source of potential perf bottleneck. This code here can "thrash" in
  // high move volume situations. Ie. allocate and deallocate a lot of PseudoChess
  // objects.
  const chess = new PseudoChess(game.chessState.fen);
  if (!chess.movePiece(move, game.turn)) {
    return { ok: false, error: "Invalid move" };
  }

  const nextState = produce(game, (draft) => {
    const newFen = chess.toFen();
    const chessOutcome = chess.outcome();
    const outcome: Outcome | undefined = chessOutcome.winner
      ? {
          winner: chessOutcome.winner,
          message: "mate",
        }
      : undefined;

    draft.chessState.fen = newFen;

    const opponent = opposite(draft.turn);
    const currentBidStack =
      draft.auctionState.bidHistory[draft.auctionState.bidHistory.length - 1]!;

    // Check if opponent is broke - they automatically fold
    if (draft.auctionState.balance[opponent] === 0) {
      draft.auctionState.balance[draft.turn] -= draft.auctionState.minBid;
      // Push a fold for the broke player
      currentBidStack.push({ fold: true });
      draft.auctionState.bidHistory.push([]);

      draft.auctionState.minBid = 1;
      draft.phase = "move";
      // turn stays the same
    } else if (draft.auctionState.balance[draft.turn] === 0) {
      // Check if the player just went for broke. If they did, just automatically
      // give the move to opponent.

      // For now keep 1 as the defacto minBid.
      const foldBidStack = [
        { fold: false as const, amount: 1 },
        { fold: true as const },
      ];
      draft.auctionState.bidHistory.push(foldBidStack);
      draft.auctionState.balance[opponent] -= 1;

      draft.auctionState.minBid = 1;
      draft.turn = opponent;
      draft.phase = "move";
    } else {
      // Normal flow: switch to bid phase
      draft.auctionState.bidHistory.push([]);
      draft.turn = opponent;
      draft.auctionState.minBid = 1; // TODO: define a function for starting minBid based on gameState.
      draft.phase = "bid";
    }

    if (outcome) {
      draft.outcome = outcome;
    } else if (
      draft.auctionState.balance.white <= 0 &&
      draft.auctionState.balance.black <= 0
    ) {
      // egregious code.
      // TODO: This actually gives the opposite player one less move than it should. There is more complex state here.
      draft.auctionState.balance.white = 0;
      draft.auctionState.balance.black = 0;
      draft.outcome = { winner: null, message: "draw" };
    }
  });

  return {
    ok: true,
    value: nextState,
  };
}

function recordBid(game: AuctionChessState, bid: Bid) {
  return produce(game, (draft) => {
    const bidStack =
      draft.auctionState.bidHistory.at(-1)!;
    const lastBid = bidStack.at(-1);
    const lastBidAmount = lastBid && "amount" in lastBid ? lastBid.amount : 0;

    bidStack.push(bid);
    draft.turn = opposite(draft.turn);

    console.log({lastBidAmount, len: bidStack.length, minBid: draft.auctionState.minBid});


    if (bid.fold) {
      draft.auctionState.balance[draft.turn] -= lastBidAmount;

      draft.auctionState.bidHistory.push([]);
      draft.phase = "move";
    }
  });
}

function updateMinBid(game: AuctionChessState) {
  return produce(game, draft => {
    const bidStack =
      draft.auctionState.bidHistory.at(-1)!;
    const lastBid = bidStack.at(-1);
    const lastBidAmount = lastBid && "amount" in lastBid ? lastBid.amount : 0;

    draft.auctionState.minBid = lastBidAmount + bidStack.length + 1;
  })
}

export function makeBid(game: AuctionChessState, bid: Bid): GameResult {
  if (game.outcome) return { ok: false, error: "Game already over." };

  if (game.phase !== "bid") {
    return { ok: false, error: "Not in bid phase" };
  }
  const bidStack =
    game.auctionState.bidHistory.at(-1)!;
  const lastBid = bidStack.at(-1);
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

  game = recordBid(game, bid);

  const newTurnBalance = game.auctionState.balance[game.turn];
  const newMinBid = game.auctionState.minBid;

  // If new player can't bid then autofold for them.
  if (newTurnBalance < newMinBid || newTurnBalance === 0) {
    game = recordBid(game, { fold: true });
  }

  return {
    ok: true,
    value: updateMinBid(game),
  };
}

export function deductTime(
  game: AuctionChessState,
  timeUsed: number,
): GameResult {
  if (!game.timeState) return { ok: true, value: game };

  const nextState = produce(game, (draft) => {
    if (!draft.timeState) throw Error("how");

    draft.timeState.time[draft.turn] -= timeUsed;

    if (draft.timeState.time[draft.turn] >= 0) {
      draft.timeState.prev = Date.now();
    } else {
      // Ran out of time!
      draft.timeState.time[draft.turn] = 0;
      draft.timeState.prev = null;

      draft.outcome = {
        winner: opposite(draft.turn),
        message: "timeout",
      };
    }
  });

  return { ok: true, value: nextState };
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
