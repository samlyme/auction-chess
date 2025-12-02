import { opposite } from "chessops";
import { PseudoChess } from "./pseudoChess";
import type { Bid, AuctionChessState, NormalMove, Color } from "../index";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const STARTING_BALANCE = 1000;

export function createGame(): AuctionChessState {
  return {
    chessState: { fen: STARTING_FEN },
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
  move: NormalMove
): AuctionChessState | { error: string } {
  if (game.phase !== "move") {
    return { error: "Not in move phase" };
  }

  const chess = new PseudoChess(game.chessState.fen);
  if (!chess.movePiece(move, game.turn)) {
    return { error: "Invalid move" };
  }

  const newFen = chess.toFen();
  const outcome = chess.outcome();
  const { balance, bidHistory } = game.auctionState;
  const currentBidStack = bidHistory[bidHistory.length - 1]!;

  // Check if a player is broke
  if (balance.white === 0 || balance.black === 0) {
    const brokePlayer: Color = balance.white === 0 ? "white" : "black";
    const richPlayer = opposite(brokePlayer);

    balance[richPlayer] -= 1;
    currentBidStack.push({
      amount: 1,
      fold: false,
      from: richPlayer,
    });
    bidHistory.push([]);

    return {
      chessState: { fen: newFen },
      auctionState: { balance, bidHistory },
      turn: richPlayer,
      phase: "move",
      winner: outcome.winner,
    };
  }

  // Normal flow: switch to bid phase
  const nextPlayer = opposite(game.turn);
  bidHistory.push([]);

  return {
    chessState: { fen: newFen },
    auctionState: { balance, bidHistory },
    turn: nextPlayer,
    phase: "bid",
    winner: outcome.winner,
  };
}

export function makeBid(
  game: AuctionChessState,
  bid: Bid
): AuctionChessState | { error: string } {
  if (game.phase !== "bid") {
    return { error: "Not in bid phase" };
  }

  if (bid.from !== game.turn) {
    return { error: "Not your turn" };
  }

  const { balance, bidHistory } = game.auctionState;
  const bidStack = bidHistory[bidHistory.length - 1]!;
  const lastBid = bidStack[bidStack.length - 1];
  const lastBidAmount = lastBid?.amount ?? 0;

  // Validate non-fold bids
  if (!bid.fold) {
    if (bid.amount <= 0) {
      return { error: "Bid amount must be positive" };
    }
    if (bid.amount <= lastBidAmount) {
      return { error: "Bid must be higher than previous bid" };
    }
    if (bid.amount > balance[bid.from]) {
      return { error: "Insufficient balance" };
    }
  }

  // Handle fold
  if (bid.fold) {
    if (lastBid) {
      balance[lastBid.from] -= lastBid.amount;
    }
    bidStack.push(bid);

    return {
      chessState: game.chessState,
      auctionState: { balance, bidHistory },
      turn: opposite(game.turn),
      phase: "move",
      winner: game.winner,
    };
  }

  // Handle bid that opponent can't beat
  if (bid.amount >= balance[opposite(bid.from)]) {
    balance[bid.from] -= bid.amount;
    bidStack.push(bid);

    return {
      chessState: game.chessState,
      auctionState: { balance, bidHistory },
      turn: game.turn,
      phase: "move",
      winner: game.winner,
    };
  }

  // Normal bid: continue bidding
  bidStack.push(bid);

  return {
    ...game,
    auctionState: { balance, bidHistory },
    turn: opposite(game.turn),
  };
}

export function getCurrentBidStack(game: AuctionChessState): Bid[] {
  return game.auctionState.bidHistory[game.auctionState.bidHistory.length - 1]!;
}

export function getLastBid(game: AuctionChessState): Bid | undefined {
  const bidStack = getCurrentBidStack(game);
  return bidStack[bidStack.length - 1];
}