import { produce } from "immer";
import type { AuctionChessState } from "../types/game";
import { opposite } from "chessops";
import type { Result } from "../types/result";

// TODO: make transfer functions a file.
export function deductTime(game: AuctionChessState, timeUsed: number): void {
  if (!game.timeState) throw new Error("Time not enabled");

  game.timeState.time[game.turn] -= timeUsed;

  if (game.timeState.time[game.turn] >= 0) {
    game.timeState.prev = Date.now();
  } else {
    // Ran out of time!
    game.timeState.time[game.turn] = 0;
    game.timeState.prev = null;

    game.outcome = {
      winner: opposite(game.turn),
      message: "timeout",
    };
  }
}

export function timecheck(game: AuctionChessState, timeUsed: number): void {
  if (!game.timeState) throw new Error("Time not enabled.");

  if (game.timeState && timeUsed >= game.timeState.time[game.turn]) {
    // TODO: make a helper function for this
    game.timeState.prev = null;
    game.timeState.time[game.turn] = 0;
    game.outcome = {
      winner: game.turn === "white" ? "black" : "white",
      message: "timeout",
    };
  }
}
