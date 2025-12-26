import { type Context, Hono } from "hono";
import {
  LobbyJoinQuery,
  LobbyToPayload,
} from "shared";
import type { LobbyEnv, MaybeLobbyEnv } from "../types/honoEnvs.ts";
import { getProfile, validateProfile } from "../middleware/profiles.ts";
import { getLobby, validateLobby } from "../middleware/lobbies.ts";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import {
  broadcastLobbyDelete,
  broadcastLobbyUpdate,
} from "../utils/realtime.ts";
import { runConcurrently } from "../utils/concurrency.ts";
import { createLobby, deleteLobby, endGame, getLobbyByCode, joinLobby, leaveLobby, startGame } from "../state/lobbies.ts";

const route = new Hono<MaybeLobbyEnv>()
  // could be a perf bottleneck since we are getting their profile on each req.
  .use(runConcurrently(getLobby, getProfile), validateProfile)

  .post("/", async (c: Context<MaybeLobbyEnv>) => {
    const supabase = c.get("supabase");
    if (c.get("lobby"))
      throw new HTTPException(400, { message: "user already in lobby" });

    // TODO: implement body parsing for lobby config.
    const lobby = createLobby(c.get("user").id, {
      gameConfig: {
        hostColor: "white",
        initTime: {
          white: 3 * 1000, // Thirty seconds for dev.
          black: 3 * 1000,
        }
      }
    });
    if (!lobby)
      throw new HTTPException(500, { message: "failed to create lobby" });

    const channel = supabase.channel(`lobby-${lobby.code}`);

    const payload = broadcastLobbyUpdate(channel, lobby);
    return c.json(payload);
  })

  .get("", (c: Context<MaybeLobbyEnv>) => {
    const lobby = c.get("lobby");
    return c.json(lobby ? LobbyToPayload.parse(lobby) : null);
  })

  .delete("/", validateLobby, async (c: Context<LobbyEnv>) => {
    const lobby = c.get("lobby");
    const channel = c.get("channel");

    const user = c.get("user");
    if (user.id !== lobby.hostUid)
      throw new HTTPException(401, {
        message: `You are not the host of lobby ${lobby.code}`,
      });

    deleteLobby(lobby.code);
    broadcastLobbyDelete(channel);
    return c.json(null);
  })

  .post("/join", zValidator("query", LobbyJoinQuery), async (c) => {
    if (c.get("lobby"))
      throw new HTTPException(400, { message: "user already in lobby" });

    const userId = c.get("user").id;
    const { code } = c.req.valid("query");

    const lobby = getLobbyByCode(code);
    if (!lobby) throw new HTTPException(404, { message: "lobby not found" });
    if (lobby.guestUid) throw new HTTPException(400, { message: "lobby full" });

    joinLobby(userId, code);

    const supabase = c.get("supabase");
    const channel = supabase.channel(`lobby-${code}`);
    const payload = broadcastLobbyUpdate(channel, lobby);
    return c.json(payload);
  })

  .post("/leave", validateLobby, async (c: Context<LobbyEnv>) => {
    const lobby = c.get("lobby");

    const user = c.get("user");
    if (user.id !== lobby.guestUid)
      throw new HTTPException(400, {
        message: `user is not guest in lobby ${lobby.code}`,
      });

    leaveLobby(lobby.code);

    const channel = c.get("channel");
    const payload = broadcastLobbyUpdate(channel, lobby);
    return c.json(payload);
  })

  // TODO: use new state manager
  .post("/start", validateLobby, async (c: Context<LobbyEnv>) => {
    const lobby = c.get("lobby");
    const channel = c.get("channel");
    const user = c.get("user");

    if (user.id !== lobby.hostUid)
      throw new HTTPException(400, {
        message: `user is not host of lobby ${lobby.code}`,
      });

    if (!lobby.guestUid)
      throw new HTTPException(400, {
        message: "cannot start lobby without a guest",
      });

    if (lobby.gameState !== null)
      throw new HTTPException(400, {
        message: "lobby already started",
      });

    // Initialize default game state for Auction Chess
    startGame(lobby.code);

    const payload = broadcastLobbyUpdate(channel, lobby);
    return c.json(payload);
  })

  // TODO: Use new state manager
  .post("/end", validateLobby, async (c: Context<LobbyEnv>) => {
    const lobby = c.get("lobby");
    const channel = c.get("channel");
    const user = c.get("user");

    if (user.id !== lobby.hostUid)
      throw new HTTPException(400, {
        message: `user is not host of lobby ${lobby.code}`,
      });

    if (lobby.gameState === null)
      throw new HTTPException(400, {
        message: "lobby not started",
      });

    // Initialize default game state for Auction Chess
    endGame(lobby.code);

    const payload = broadcastLobbyUpdate(channel, lobby);
    return c.json(payload);
  });

export { route as lobbies };
