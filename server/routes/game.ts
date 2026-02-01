import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { Bid, GameTransient, GameUpdate, NormalMove } from "shared/types/game";
import type { GameEnv } from "../types/honoEnvs";
import {
  recordReceivedTime,
  validateGame,
  validatePlayer,
  validateTurn,
} from "../middleware/game";
import { getLobby, validateLobby } from "../middleware/lobbies";
import { broadcastGameUpdate } from "../utils/realtime";
import { wrapTime } from "hono/timing";
import { updateDeductTime, updateGame, updateTimecheck } from "shared/game/update";

const gameplay = new Hono<GameEnv>()
  .use(
    recordReceivedTime,
    getLobby,
    validateLobby,
    validateGame,
    validatePlayer,
    validateTurn,
  )

  .post("/update", zValidator("json", GameUpdate), async (c) => {
    const gameState = c.get("gameState");
    const channel = c.get("channel");
    const update = c.req.valid("json");
    const timeUsed = c.get("timeUsed");

    const log: GameTransient[] = [];
    try {
      updateDeductTime({ game: gameState, log }, timeUsed);
      updateGame({ game: gameState, log }, update);
    } catch (e) {
      throw new HTTPException(400, { message: JSON.stringify(e) });
    } finally {
      await wrapTime(c, "broadcast", broadcastGameUpdate(channel, { game: gameState, log }));
    }
    return c.json(gameState);
  });

const timecheckRoute = new Hono()
  .use(recordReceivedTime, getLobby, validateLobby, validateGame)
  .post("/", async (c) => {
    const gameState = c.get("gameState");
    const timeUsed = c.get("timeUsed");

    const log: GameTransient[] = [];
    try {
      updateTimecheck({ game: gameState, log }, timeUsed);
    } catch (e) {
      throw new HTTPException(400, { message: JSON.stringify(e) });
    } finally {
      const channel = c.get("channel");
      await wrapTime(c, "broadcast", broadcastGameUpdate(channel, { game: gameState, log }));
    }
    return c.body(null, 204);
  });

const app = new Hono<GameEnv>()
  .route("/play", gameplay)
  .route("/timecheck", timecheckRoute);

export { app as game };
