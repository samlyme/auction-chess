import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { Bid, NormalMove, type Color } from "shared";
import { makeBid as makeBidLogic, movePiece as movePieceLogic } from "shared/game/auctionChess";
import type { GameEnv } from "../types.ts";
import { validateGame, validatePlayer, validateTurn } from "../middleware/game.ts";
import { broadcastGame } from "../middleware/game.ts";

const app = new Hono<GameEnv>();

// All game routes require validateGame and validatePlayer
app.use(validateGame, validatePlayer);

app.get("/", (c) => {
  const gameState = c.get("gameState");

  return c.json(gameState);
});

// POST /game/bid - Make a bid in the auction phase
app.post(
  "/bid",
  validateTurn,
  zValidator("json", Bid),
  async (c, next) => {
    const supabase = c.get("supabase");
    const lobby = c.get("lobby");
    const gameState = c.get("gameState");
    const playerColor = c.get("playerColor") as Color;
    const bid = (c.req as any).valid("json");

    // Ensure the bid is from the correct player
    if (bid.from !== playerColor) {
      throw new HTTPException(400, {
        message: `Cannot bid as ${bid.from}, you are ${playerColor}`,
      });
    }

    const result = makeBidLogic(gameState, bid);

    if ("error" in result) {
      throw new HTTPException(400, { message: result.error });
    }

    // Update the game state in the database
    const { data: updatedLobby, error } = await supabase
      .from("lobbies")
      .update({ game_state: result })
      .eq("code", lobby.code)
      .select()
      .single();

    if (error) {
      throw new HTTPException(500, {
        message: `Failed to update game state: ${error.message}`,
      });
    }

    c.set("lobby", updatedLobby);
    await next();
  },
  broadcastGame,
);

// POST /game/move - Make a chess move
app.post(
  "/move",
  validateTurn,
  zValidator("json", NormalMove),
  async (c, next) => {
    const supabase = c.get("supabase");
    const lobby = c.get("lobby");
    const gameState = c.get("gameState");
    const playerColor = c.get("playerColor") as Color;
    const move = (c.req as any).valid("json");

    // Ensure it's the player's turn
    if (gameState.turn !== playerColor) {
      throw new HTTPException(400, {
        message: `Not your turn (current turn: ${gameState.turn})`,
      });
    }

    const result = movePieceLogic(gameState, move);

    if ("error" in result) {
      throw new HTTPException(400, { message: result.error });
    }

    // Update the game state in the database
    const { data: updatedLobby, error } = await supabase
      .from("lobbies")
      .update({ game_state: result })
      .eq("code", lobby.code)
      .select()
      .single();

    if (error) {
      throw new HTTPException(500, {
        message: `Failed to update game state: ${error.message}`,
      });
    }

    c.set("lobby", updatedLobby);
    await next();
  },
  broadcastGame,
);

export { app as game };
