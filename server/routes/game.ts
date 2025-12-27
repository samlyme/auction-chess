import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { Bid, NormalMove, type Color } from "shared";
import {
  makeBid as makeBidLogic,
  movePiece as movePieceLogic,
} from "shared/game/auctionChess";
import type { GameEnv } from "../types/honoEnvs.ts";
import {
  recordReceivedTime,
  validateGame,
  validatePlayer,
  validateTime,
  validateTurn,
} from "../middleware/game.ts";
import { getLobby, validateLobby } from "../middleware/lobbies.ts";
import { broadcastGameUpdate } from "../utils/realtime.ts";
import { wrapTime } from "hono/timing";
import { updateGameState } from "../state/lobbies.ts";

const app = new Hono<GameEnv>()
  .use(recordReceivedTime,  getLobby, validateLobby)

  // GET /game - Get the current game state
  .get("/", (c) => {
    // NOTE: here, gameState is actually nullable.
    const { gameState } = c.get("lobby");
    return c.json(gameState || null);
  })

  // POST /game/bid - Make a bid in the auction phase
  .post(
    "/bid",
    validateGame,
    validateTime,
    validatePlayer,
    validateTurn,
    zValidator("json", Bid),
    async (c) => {
      const lobby = c.get("lobby");
      const gameState = c.get("gameState");
      const channel = c.get("channel");
      const bid = c.req.valid("json");

      const receivedTime = c.get("receivedTime");
      const usedTime = gameState.timeState.prev === null ? 0 : receivedTime - gameState.timeState.prev;
      // TODO: make this use the receivedTime.
      const result = makeBidLogic(gameState, bid, usedTime);

      if (!result.ok) {
        throw new HTTPException(400, { message: result.error });
      }

      await wrapTime(c, "broadcast", broadcastGameUpdate(channel, result.value))
      // Lag compensation for realtime service.
      // result.value.timeState.prev = Date.now();
      updateGameState(lobby.code, result.value)

      return c.body(null, 204);
    },
  )

  // POST /game/move - Make a chess move
  .post(
    "/move",
    validateGame,
    validateTime,
    validatePlayer,
    validateTurn,
    zValidator("json", NormalMove),
    async (c) => {
      const lobby = c.get("lobby");
      const gameState = c.get("gameState");
      const channel = c.get("channel");
      const playerColor = c.get("playerColor") as Color;
      const move = c.req.valid("json");

      const receivedTime = c.get("receivedTime");
      const usedTime = gameState.timeState.prev === null ? 0 : receivedTime - gameState.timeState.prev;

      // Ensure it's the player's turn
      if (gameState.turn !== playerColor) {
        throw new HTTPException(400, {
          message: `Not your turn (current turn: ${gameState.turn})`,
        });
      }

      const result = movePieceLogic(gameState, move, usedTime);

      if (!result.ok) {
        throw new HTTPException(400, { message: result.error });
      }

      await wrapTime(c, "broadcast", broadcastGameUpdate(channel, result.value));
      // Supabase Realtime Service Lag comp.
      // result.value.timeState.prev = Date.now();
      updateGameState(lobby.code, result.value);

      return c.body(null, 204);
    },
  );

export { app as game };
