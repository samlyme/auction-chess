import type {
  AuctionChessState,
  GameTransient,
  GameUpdate,
} from "../types/game";
import { exitBid, exitMove } from "./transitionFunctions";

// Conventions: keep the core game as in place mutations.
// if statelessness is needed, wrap the actual functions here with Immer.
export function updateGame(
  game: AuctionChessState,
  update: GameUpdate,
): GameTransient[] {
  if (game.outcome) throw new Error("Game already over.");

  const log: GameTransient[] = [];

  switch (update.type) {
    case "bid":
      {
        if (game.phase !== "bid") throw new Error("Not in Bid phase.");
        const bid = update.data;
        exitBid({ game, log }, bid, game.turn); // record and exit bid state
      }
      break;

    case "move":
      {
        if (game.phase !== "move") throw new Error("Not in Move phase.");
        const move = update.data;
        exitMove({ game, log }, move, game.turn);
      }
      break;
  }

  return log;
}
