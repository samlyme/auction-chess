import { type Context, Hono } from "hono";
import {
  AuctionChessState,
  Lobby,
  LobbyJoinQuery,
  LobbyToPayload,
} from "shared";
import type { LobbyEnv, MaybeLobbyEnv } from "../types.ts";
import { getProfile, validateProfile } from "../middleware/profiles.ts";
import { getLobby, validateLobby } from "../middleware/lobbies.ts";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { createGame } from "shared/game/auctionChess.ts";
import {
  broadcastLobbyDelete,
  broadcastLobbyUpdate,
} from "../utils/realtime.ts";
import { runConcurrently } from "../utils/concurrency.ts";
import { createLobby, deleteLobby, endLobby, joinLobby, leaveLobby, startLobby } from "../state/lobbies.ts";

const route = new Hono<MaybeLobbyEnv>()
  // could be a perf bottleneck since we are getting their profile on each req.
  .use(runConcurrently(getLobby, getProfile), validateProfile)

  .post("/", async (c: Context<MaybeLobbyEnv>) => {
    const supabase = c.get("supabase");
    if (c.get("lobby"))
      throw new HTTPException(400, { message: "user already in lobby" });

    const lobby = createLobby(c.get("user").id);
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
    if (user.id !== lobby.host_uid)
      throw new HTTPException(401, {
        message: `You are not the host of lobby ${lobby.code}`,
      });

    if (!deleteLobby(user.id, lobby.code))
      throw new HTTPException(500, {
        message: "failed to delete lobby",
      });

    broadcastLobbyDelete(channel);
    return c.json(null);
  })

  .post("/join", zValidator("query", LobbyJoinQuery), async (c) => {
    if (c.get("lobby"))
      throw new HTTPException(400, { message: "user already in lobby" });

    const userId = c.get("user").id;
    const { code } = c.req.valid("query");

    const lobby = joinLobby(userId, code);

    if (!lobby) throw new HTTPException(400, { message: "could not join lobby" });

    const supabase = c.get("supabase");
    const channel = supabase.channel(`lobby-${lobby.code}`);
    const payload = broadcastLobbyUpdate(channel, lobby);
    return c.json(payload);
  })

  .post("/leave", validateLobby, async (c: Context<LobbyEnv>) => {
    const supabase = c.get("supabase");
    const lobby = c.get("lobby");
    const channel = c.get("channel");

    const user = c.get("user");
    if (user.id !== lobby.guest_uid)
      throw new HTTPException(400, {
        message: `user is not guest in lobby ${lobby.code}`,
      });

    const newLobby = leaveLobby(user.id, lobby.code);

    const payload = broadcastLobbyUpdate(channel, newLobby);
    return c.json(payload);
  })

  // TODO: use new state manager
  .post("/start", validateLobby, async (c: Context<LobbyEnv>) => {
    const supabase = c.get("supabase");
    const lobby = c.get("lobby");
    const channel = c.get("channel");
    const user = c.get("user");

    if (user.id !== lobby.host_uid)
      throw new HTTPException(400, {
        message: `user is not host of lobby ${lobby.code}`,
      });

    if (!lobby.guest_uid)
      throw new HTTPException(400, {
        message: "cannot start lobby without a guest",
      });

    if (lobby.game_state !== null)
      throw new HTTPException(400, {
        message: "lobby already started",
      });

    // Initialize default game state for Auction Chess
    const updatedLobby = startLobby(user.id, lobby.code);
    if (!updatedLobby) throw new HTTPException(500, { message: "failed to start lobby" })

    const payload = broadcastLobbyUpdate(channel, updatedLobby);
    return c.json(payload);
  })

  // TODO: Use new state manager
  .post("/end", validateLobby, async (c: Context<LobbyEnv>) => {
    const supabase = c.get("supabase");
    const lobby = c.get("lobby");
    const channel = c.get("channel");
    const user = c.get("user");

    if (user.id !== lobby.host_uid)
      throw new HTTPException(400, {
        message: `user is not host of lobby ${lobby.code}`,
      });

    if (lobby.game_state === null)
      throw new HTTPException(400, {
        message: "lobby not started",
      });

    // Initialize default game state for Auction Chess
    const updatedLobby = endLobby(user.id, lobby.code);
    if (!updatedLobby) throw new HTTPException(500, { message: "failed to start lobby" })

    const payload = broadcastLobbyUpdate(channel, updatedLobby);
    return c.json(payload);
  });

export { route as lobbies };
