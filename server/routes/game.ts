import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { Bid, NormalMove, type Color } from "shared";
import { makeBid as makeBidLogic, movePiece as movePieceLogic } from "shared/game/auctionChess";
import type { GameEnv } from "../types.ts";
import { validateGame, validatePlayer, validateTurn } from "../middleware/game.ts";
import { validateLobby } from "../middleware/lobbies.ts";
import { broadcastGameUpdate } from "../utils/realtime.ts";

const app = new Hono<GameEnv>();

// GET /game - Get the current game state
app.get("/", (c) => {
  // NOTE: here, gameState is actually nullable.
  const { game_state }= c.get("lobby");
  return c.json(game_state || null);
});

// POST /game/bid - Make a bid in the auction phase
app.post(
  "/bid",
  validateLobby,
  validateGame,
  validatePlayer,
  validateTurn,
  zValidator("json", Bid),
  async (c) => {
    const supabase = c.get("supabase");
    const lobby = c.get("lobby");
    const gameState = c.get("gameState");
    const channel = c.get("channel");
    const bid = c.req.valid("json");

    // Game verification logic is actually really quick.
    // It's the db trip that takes a while.
    // Refactor so the persist actually comes after.
    // const start = Date.now();
    const result = makeBidLogic(gameState, bid);
    // console.log(`Verify bid logic: ${Date.now() - start}`);

    if (!result.ok) {
      throw new HTTPException(400, { message: result.error });
    }

    // Update the game state in the database
    const { data: updatedLobby, error } = await supabase
      .from("lobbies")
      .update({ game_state: result.value })
      .eq("code", lobby.code)
      .select()
      .single();

    if (error) {
      throw new HTTPException(500, {
        message: `Failed to update game state: ${error.message}`,
      });
    }

    broadcastGameUpdate(channel, updatedLobby.game_state);
    return c.json(null);
  },
);

// POST /game/move - Make a chess move
app.post(
  "/move",
  validateLobby,
  validateGame,
  validatePlayer,
  validateTurn,
  zValidator("json", NormalMove),
  async (c) => {
    const supabase = c.get("supabase");
    const lobby = c.get("lobby");
    const gameState = c.get("gameState");
    const channel = c.get("channel");
    const playerColor = c.get("playerColor") as Color;
    const move = c.req.valid("json");

    // Ensure it's the player's turn
    if (gameState.turn !== playerColor) {
      throw new HTTPException(400, {
        message: `Not your turn (current turn: ${gameState.turn})`,
      });
    }

    const result = movePieceLogic(gameState, move);

    if (!result.ok) {
      throw new HTTPException(400, { message: result.error });
    }

    // Update the game state in the database
    const { data: updatedLobby, error } = await supabase
      .from("lobbies")
      .update({ game_state: result.value })
      .eq("code", lobby.code)
      .select()
      .single();

    if (error) {
      throw new HTTPException(500, {
        message: `Failed to update game state: ${error.message}`,
      });
    }

    broadcastGameUpdate(channel, updatedLobby.game_state);
    return c.json(null);
  },
);

export { app as game };
