import { describe, test, expect } from "bun:test";
import {
  createGame,
  makeBid,
  movePiece,
  getCurrentBidStack,
  getLastBid,
} from "./auctionChess";

describe("createGame", () => {
  test("creates game with correct initial state", () => {
    const game = createGame();

    expect(game.phase).toBe("bid");
    expect(game.turn).toBe("white");
    expect(game.winner).toBeUndefined();
    expect(game.chessState.fen).toBe(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    expect(game.auctionState.balance).toEqual({ white: 1000, black: 1000 });
    expect(game.auctionState.bidHistory).toEqual([[]]);
  });
});

describe("makeBid", () => {
  test("rejects bid when not in bid phase", () => {
    const game = createGame();
    game.phase = "move";

    const result = makeBid(game, { amount: 10 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Not in bid phase");
    }
  });

  test("rejects non-positive bid amounts", () => {
    const game = createGame();

    const result = makeBid(game, { amount: 0 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Bid amount must be positive");
    }
  });

  test("rejects bid lower than or equal to previous bid", () => {
    const game = createGame();

    // First bid
    const firstBid = makeBid(game, { amount: 100 });
    expect(firstBid.ok).toBe(true);

    if (!firstBid.ok) return;

    // Try to bid same amount
    const sameBid = makeBid(firstBid.value, { amount: 100 });
    expect(sameBid.ok).toBe(false);
    if (!sameBid.ok) {
      expect(sameBid.error).toBe("Bid must be higher than previous bid");
    }

    // Try to bid lower
    const lowerBid = makeBid(firstBid.value, { amount: 50 });
    expect(lowerBid.ok).toBe(false);
    if (!lowerBid.ok) {
      expect(lowerBid.error).toBe("Bid must be higher than previous bid");
    }
  });

  test("rejects bid exceeding balance", () => {
    const game = createGame();

    const result = makeBid(game, { amount: 1001 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Insufficient balance");
    }
  });

  test("accepts valid first bid and switches turn", () => {
    const game = createGame();

    const result = makeBid(game, { amount: 100 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.phase).toBe("bid");
    expect(result.value.turn).toBe("black"); // Turn switches
    expect(getCurrentBidStack(result.value)).toEqual([{ amount: 100 }]);
    expect(result.value.auctionState.balance).toEqual({ white: 1000, black: 1000 }); // Balance not deducted yet
  });

  test("accepts valid counter-bid", () => {
    const game = createGame();

    const firstBid = makeBid(game, { amount: 100 });
    expect(firstBid.ok).toBe(true);
    if (!firstBid.ok) return;

    const secondBid = makeBid(firstBid.value, { amount: 150 });
    expect(secondBid.ok).toBe(true);
    if (!secondBid.ok) return;

    expect(secondBid.value.turn).toBe("white");
    expect(getCurrentBidStack(secondBid.value)).toEqual([
      { amount: 100 },
      { amount: 150 },
    ]);
  });

  test("handles fold after opponent bid - deducts balance and switches to move phase", () => {
    const game = createGame();

    // White bids 100
    const whiteBid = makeBid(game, { amount: 100 });
    expect(whiteBid.ok).toBe(true);
    if (!whiteBid.ok) return;

    // Black folds
    const blackFold = makeBid(whiteBid.value, { fold: true });
    expect(blackFold.ok).toBe(true);
    if (!blackFold.ok) return;

    expect(blackFold.value.phase).toBe("move");
    expect(blackFold.value.turn).toBe("white"); // White won the bid, so opponent (black) moves
    expect(blackFold.value.auctionState.balance).toEqual({
      white: 900, // 1000 - 100
      black: 1000
    });
    expect(getCurrentBidStack(blackFold.value)).toEqual([
      { amount: 100 },
      { fold: true },
    ]);
  });

  test("handles fold when no prior bid - switches to move phase without balance change", () => {
    const game = createGame();

    const result = makeBid(game, { fold: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.phase).toBe("move");
    expect(result.value.turn).toBe("black"); // Opponent of white (who folded)
    expect(result.value.auctionState.balance).toEqual({ white: 1000, black: 1000 });
  });

  test("handles bid that opponent cannot beat - deducts balance and switches to move phase", () => {
    const game = createGame();

    // White bids 1000 (black has exactly 1000, can't beat it)
    const result = makeBid(game, { amount: 1000 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.phase).toBe("move");
    expect(result.value.turn).toBe("white"); // White won the bid, stays their turn to move
    expect(result.value.auctionState.balance.white).toBe(0); // 1000 - 1000
    expect(getCurrentBidStack(result.value)).toEqual([{ amount: 1000 }]);
  });

  test("handles bid equal to opponent balance (edge case)", () => {
    const game = createGame();
    game.auctionState.balance.black = 500;

    const result = makeBid(game, { amount: 500 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.phase).toBe("move");
    expect(result.value.turn).toBe("white");
    expect(result.value.auctionState.balance.white).toBe(500); // 1000 - 500
  });
});

describe("movePiece", () => {
  test("rejects move when not in move phase", () => {
    const game = createGame();

    const result = movePiece(game, { from: 12, to: 28 }); // e2 to e4

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Not in move phase");
    }
  });

  test("rejects invalid chess move", () => {
    const game = createGame();

    // Get to move phase first
    const bid = makeBid(game, { fold: true });
    expect(bid.ok).toBe(true);
    if (!bid.ok) return;

    // Try invalid move (e.g., move pawn 3 squares)
    const result = movePiece(bid.value, { from: 12, to: 36 }); // e2 to e5

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Invalid move");
    }
  });

  test("accepts valid move and switches to bid phase", () => {
    const game = createGame();

    // White folds, so black moves
    const bid = makeBid(game, { fold: true });
    expect(bid.ok).toBe(true);
    if (!bid.ok) return;

    // Black makes valid move e7-e5
    const result = movePiece(bid.value, { from: 52, to: 36 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.phase).toBe("bid");
    expect(result.value.turn).toBe("white"); // Next turn
    expect(result.value.chessState.fen).not.toBe(bid.value.chessState.fen); // FEN updated
    expect(result.value.auctionState.bidHistory.length).toBe(2); // New bid stack created
  });

  test("handles broke opponent (auto-fold) - stays in move phase", () => {
    const game = createGame();

    // Set up: White bids all money, black is broke
    game.auctionState.balance = { white: 0, black: 1000 };
    game.phase = "move";
    game.turn = "black";

    // Black moves
    const result = movePiece(game, { from: 52, to: 36 }); // e7 to e5
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // White is broke, so auto-fold happens
    expect(result.value.phase).toBe("move"); // Stays in move phase
    expect(result.value.turn).toBe("black"); // Black's turn again

    // Check that fold was added to previous bid stack and new empty stack created
    expect(result.value.auctionState.bidHistory.length).toBe(2);
    expect(result.value.auctionState.bidHistory[0]).toEqual([{ fold: true }]);
    expect(getCurrentBidStack(result.value)).toEqual([]); // Current stack is empty
  });

  test("pawn promotion works correctly", () => {
    const game = createGame();

    // Set up a position where white pawn can promote (e7 pawn to e8)
    game.chessState.fen = "8/4P3/8/8/8/8/8/4K2k w - - 0 1";
    game.phase = "move";
    game.turn = "white";

    const result = movePiece(game, { from: 52, to: 60, promotion: "queen" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.chessState.fen).toContain("Q"); // Queen on the board
  });
});

describe("getCurrentBidStack", () => {
  test("returns current bid stack", () => {
    const game = createGame();

    expect(getCurrentBidStack(game)).toEqual([]);

    const bid = makeBid(game, { amount: 100 });
    expect(bid.ok).toBe(true);
    if (!bid.ok) return;

    expect(getCurrentBidStack(bid.value)).toEqual([{ amount: 100 }]);
  });

  test("returns latest bid stack after move", () => {
    const game = createGame();

    // Fold and move to create new bid stack
    const bid = makeBid(game, { fold: true });
    expect(bid.ok).toBe(true);
    if (!bid.ok) return;

    const move = movePiece(bid.value, { from: 52, to: 36 });
    expect(move.ok).toBe(true);
    if (!move.ok) return;

    // Should be empty new stack
    expect(getCurrentBidStack(move.value)).toEqual([]);
    expect(move.value.auctionState.bidHistory.length).toBe(2);
  });
});

describe("getLastBid", () => {
  test("returns undefined for empty bid stack", () => {
    const game = createGame();

    expect(getLastBid(game)).toBeUndefined();
  });

  test("returns last bid from stack", () => {
    const game = createGame();

    const firstBid = makeBid(game, { amount: 100 });
    expect(firstBid.ok).toBe(true);
    if (!firstBid.ok) return;

    expect(getLastBid(firstBid.value)).toEqual({ amount: 100 });

    const secondBid = makeBid(firstBid.value, { amount: 200 });
    expect(secondBid.ok).toBe(true);
    if (!secondBid.ok) return;

    expect(getLastBid(secondBid.value)).toEqual({ amount: 200 });
  });
});
