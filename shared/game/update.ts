import type {
  GameContext,
  GameTransient,
  GameUpdate,
} from "../types/game";
import { exitBid, exitMove, incrementMoveCounter } from "./transitionFunctions";
import { timecheck, deductTime} from "./transitionFunctions";

// Conventions: keep the core game as in place mutations.
// if statelessness is needed, wrap the actual functions here with Immer.
export function updateGame(
  { game, log }: GameContext,
  update: GameUpdate,
): GameTransient[] {
  if (game.outcome) throw new Error("Game already over.");

  switch (update.type) {
    case "bid": {
      if (game.phase !== "bid") throw new Error("Not in Bid phase.");
      const bid = update.data;
      exitBid({ game, log }, bid, game.turn); // record and exit bid state
      break;
    }

    case "move": {
      if (game.phase !== "move") throw new Error("Not in Move phase.");
      const move = update.data;
      exitMove({ game, log }, move, game.turn);
      break;
    }
  }

  // The move was a success, so we inecrement!
  incrementMoveCounter({ game, log });

  return log;
}

// These two functions should be separate from regular game logic since it
// requires "special" logic to handle accross the client. For example, optimistic
// updates should NOT account for time.
export function updateTimecheck({ game, log}: GameContext, timeUsed: number): GameTransient[] {
  if (game.outcome) throw new Error("Game already over.");

  timecheck({game, log}, timeUsed);
  return log;
}

export function updateDeductTime({ game, log}: GameContext, timeUsed: number): GameTransient[] {
  if (game.outcome) throw new Error("Game already over.");

  deductTime({ game, log }, timeUsed);
  return log;
}
