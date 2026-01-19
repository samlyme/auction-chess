import { opposite } from "chessops";
import { produce } from "immer";
import {
  Bid,
  type NormalMove,
  type GameConfig,
  type AuctionChessState,
} from "../types/game";
import type { Result } from "../types/result";

import * as PseudoChess from "./purePseudoChess";
import { getPiece } from "./pureBoard";

const STARTING_BALANCE = 100;

export type GameResult = Result<AuctionChessState, string>;

export function createGame(config: GameConfig): AuctionChessState {
  const timeState = config.timeConfig.enabled
    ? {
        time: { ...config.timeConfig.initTime },
        prev: null,
      }
    : undefined;

  return {
    chessState: PseudoChess.pureDefaultSetup,
    timeState,
    auctionState: {
      balance: { white: STARTING_BALANCE, black: STARTING_BALANCE },
      bidHistory: [[]],
      minBid: 1,
    },
    turn: "white",
    phase: "bid",
  };
}

function recordMove(game: AuctionChessState, move: NormalMove) {
  return produce(game, (draft) => {
    const setup = draft.chessState;
    // const newSetup = PseudoChess.movePiece(setup, move)
    const newSetup = PseudoChess.movePiece(setup, move);
    if (!newSetup.ok) {
      throw new Error("invalid move.");
    }
    draft.chessState = newSetup.value;

    draft.turn = opposite(draft.turn);
    draft.phase = "bid";
  });
}

// TODO: factor out time logic from these
export function movePiece(
  game: AuctionChessState,
  move: NormalMove,
): GameResult {
  // TODO: optimize the number of serializations and deserializations.
  if (game.outcome) return { ok: false, error: "Game already over." };

  if (game.phase !== "move") return { ok: false, error: "Not in move phase" };

  if (game.turn !== getPiece(game.chessState.board, move.from)?.color)
    return { ok: false, error: "Can't move opponent's peices." };

  try {
    game = recordMove(game, move);

    if (!game.chessState.board.king.moreThanOne()) {
      game = produce(game, (draft) => {
        const board = draft.chessState.board;
        const winner = board.king.intersect(board.black).isEmpty()
          ? "white"
          : "black";
        draft.outcome = { winner, message: "mate" };
      });
    } else if (
      game.auctionState.balance[game.turn] < game.auctionState.minBid
    ) {
      game = recordBid(game, { fold: true });
    }
  } catch (e) {
    console.error(e);
    return { ok: false, error: "invalid move." };
  }
  return { ok: true, value: game };
}

function recordBid(game: AuctionChessState, bid: Bid) {
  return produce(game, (draft) => {
    const bidStack = draft.auctionState.bidHistory.at(-1)!;
    const lastBid = bidStack.at(-1);
    const lastBidAmount = lastBid && "amount" in lastBid ? lastBid.amount : 0;

    bidStack.push(bid);
    draft.turn = opposite(draft.turn);

    console.log({
      lastBidAmount,
      len: bidStack.length,
      minBid: draft.auctionState.minBid,
    });

    if (bid.fold) {
      draft.auctionState.balance[draft.turn] -= lastBidAmount;

      draft.auctionState.bidHistory.push([]);
      draft.phase = "move";
    }
  });
}

function updateMinBid(game: AuctionChessState) {
  return produce(game, (draft) => {
    const bidStack = draft.auctionState.bidHistory.at(-1)!;
    const lastBid = bidStack.at(-1);
    const lastBidAmount = lastBid && "amount" in lastBid ? lastBid.amount : 0;

    draft.auctionState.minBid = lastBidAmount + bidStack.length + 1;
  });
}

export function makeBid(game: AuctionChessState, bid: Bid): GameResult {
  if (game.outcome) return { ok: false, error: "Game already over." };

  if (game.phase !== "bid") {
    return { ok: false, error: "Not in bid phase" };
  }
  const bidStack = game.auctionState.bidHistory.at(-1)!;
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

  game = updateMinBid(recordBid(game, bid));

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
