import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { Bid, NormalMove } from "shared";
import {
  makeBid as makeBidLogic,
  movePiece as movePieceLogic,
  timecheck,
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

const gameplay = new Hono<GameEnv>()
  .use(
    recordReceivedTime,
    getLobby,
    validateLobby,
    validateGame,
    validateTime,
    validatePlayer,
    validateTurn,
  )
  // POST /game/bid - Make a bid in the auction phase
  .post("/bid", zValidator("json", Bid), async (c) => {
    const lobby = c.get("lobby");
    const gameState = c.get("gameState");
    const channel = c.get("channel");
    const bid = c.req.valid("json");

    const receivedTime = c.get("receivedTime");
    const result = makeBidLogic(gameState, bid, receivedTime);

    if (!result.ok) {
      throw new HTTPException(400, { message: result.error });
    }

    await wrapTime(c, "broadcast", broadcastGameUpdate(channel, result.value));
    // Lag compensation for realtime service.
    // result.value.timeState.prev = Date.now();
    updateGameState(lobby.code, result.value);

    return c.body(null, 204);
  })

  // POST /game/move - Make a chess move
  .post("/move", zValidator("json", NormalMove), async (c) => {
    const lobby = c.get("lobby");
    const gameState = c.get("gameState");
    const channel = c.get("channel");
    const move = c.req.valid("json");

    const receivedTime = c.get("receivedTime");
    const result = movePieceLogic(gameState, move, receivedTime);

    if (!result.ok) {
      throw new HTTPException(400, { message: result.error });
    }

    await wrapTime(c, "broadcast", broadcastGameUpdate(channel, result.value));
    // Supabase Realtime Service Lag comp.
    // result.value.timeState.prev = Date.now();
    updateGameState(lobby.code, result.value);

    return c.body(null, 204);
  });

const timecheckRoute = new Hono()
  .use(recordReceivedTime, getLobby, validateLobby, validateGame)
  .post("/", async (c) => {
    const gameState = c.get("gameState");
    const receivedTime = c.get("receivedTime");

    const result = timecheck(gameState, receivedTime);

    if (!result.ok) {
      throw new HTTPException(500, { message: "timecheck failed." });
    }
    const channel = c.get("channel");
    await wrapTime(c, "broadcast", broadcastGameUpdate(channel, result.value));
    return c.body(null, 204);
  });

const app = new Hono<GameEnv>()
  .route("/play", gameplay)
  .route("/timecheck", timecheckRoute);

export { app as game };
