import { opposite, SquareSet, type Piece } from "chessops";
import { produce } from "immer";
import {
  Bid,
  type NormalMove,
  type GameConfig,
  type AuctionChessState,
  Role,
  Square,
  Color,
} from "../types/game";
import type { Result } from "../types/result";

import * as PseudoChess from "./purePseudoChess";
import { getPiece } from "./pureBoard";

const STARTING_BALANCE = 100;

export type GameResult = Result<AuctionChessState, string>;

export const defaultPieceValue: Record<Role, number> = {
  "pawn": 1,
  "knight": 3,
  "bishop": 3,
  "rook": 5,
  "queen": 9,
  "king": 20,
}

export const nonePieceValue: Record<Role, number> = {
  "pawn": 0,
  "knight": 0,
  "bishop": 0,
  "rook": 0,
  "queen": 0,
  "king": 0
}
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
      interestRate: config.interestConfig.enabled ? config.interestConfig.rate : 0,
    },
    pieceIncome: config.pieceIncomeConfig.enabled ? config.pieceIncomeConfig.pieceIncome : nonePieceValue,
    pieceFee: config.pieceFeeConfig.enabled ? config.pieceFeeConfig.pieceFee : nonePieceValue,
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
function deductPieceFee(game: AuctionChessState, piece: Piece) {
  return produce(game, draft => {
    if (!draft.pieceFee) return;

    const color = piece.color;
    draft.auctionState.balance[color] -= draft.pieceFee[piece.role];
  })
}
function earnInterest(game: AuctionChessState) {
  return produce(game, draft => {
    const interestRate = draft.auctionState.interestRate;
    draft.auctionState.balance.white += Math.floor(draft.auctionState.balance.white * interestRate);
    draft.auctionState.balance.black += Math.floor(draft.auctionState.balance.black * interestRate);
  })
}
function earnPieceIncome(game: AuctionChessState) {
  return produce(game, draft => {
    const value = draft.pieceIncome;
    if (!value) return;

    for (const square of draft.chessState.board.occupied) {
      const piece = getPiece(draft.chessState.board, square)!;
      draft.auctionState.balance[piece.color] += value[piece.role];
    }
  })
}
export function movePiece(
  game: AuctionChessState,
  move: NormalMove,
): GameResult {
  if (game.outcome) return { ok: false, error: "Game already over." };

  if (game.phase !== "move") return { ok: false, error: "Not in move phase" };

  const piece = getPiece(game.chessState.board, move.from);
  if (!piece) return {ok: false, error: "Move from empty square."}
  if (game.turn !== piece.color)
    return { ok: false, error: "Can't move opponent's peices." };

  if (game.pieceFee && game.auctionState.balance[game.turn] < game.pieceFee[piece.role]) {
    return { ok: false, error: "Piece too expensive to move." };
  }

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
    } else {
      game = deductPieceFee(game, piece); // TODO: make castling cost extra.

      game = earnPieceIncome(game);
      game = earnInterest(game);
      if (game.auctionState.balance[game.turn] < game.auctionState.minBid) {
        game = recordBid(game, { fold: true });
      }
    }
  } catch (e) {
    console.error(e);

    return { ok: false, error: "invalid move." };
  }
  return { ok: true, value: game };
}

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
