import { type Context, Hono } from "hono";
import { LobbyConfig, LobbyJoinQuery, LobbyToPayload } from "shared";
import type { LobbyEnv, MaybeLobbyEnv } from "../types/honoEnvs.ts";
import { getProfile, validateProfile } from "../middleware/profiles.ts";
import { getLobby, validateLobby } from "../middleware/lobbies.ts";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import {
  createLobby,
  deleteLobby,
  endGame,
  getLobbyByCode,
  joinLobby,
  leaveLobby,
  startGame,
} from "../state/lobbies.ts";

const route = new Hono<MaybeLobbyEnv>()
  // could be a perf bottleneck since we are getting their profile on each req.
  .use(getLobby, getProfile, validateProfile)

  .post("/", zValidator("json", LobbyConfig), async (c) => {
    if (c.get("lobby"))
      throw new HTTPException(400, { message: "user already in lobby" });

    const lobbyConfig = c.req.valid("json");
    const supabase = c.get("supabase");

    // State manager handles broadcasting
    const lobby = createLobby(c.get("user").id, lobbyConfig, supabase);
    if (!lobby)
      throw new HTTPException(500, { message: "failed to create lobby" });

    return c.json(LobbyToPayload.parse(lobby));
  })

  .get("/", (c: Context<MaybeLobbyEnv>) => {
    const lobby = c.get("lobby");
    return c.json(lobby ? LobbyToPayload.parse(lobby) : null);
  })

  .get("/game", validateLobby, (c) => {
    // NOTE: here, gameState is actually nullable.
    const { gameState } = c.get("lobby");
    return c.json(gameState);
  })

  .delete("/", validateLobby, async (c: Context<LobbyEnv>) => {
    const lobby = c.get("lobby");
    const user = c.get("user");
    const supabase = c.get("supabase");

    if (user.id !== lobby.hostUid)
      throw new HTTPException(401, {
        message: `You are not the host of lobby ${lobby.code}`,
      });

    // State manager handles broadcasting
    deleteLobby(lobby.code, supabase);
    return c.json(null);
  })

  .post("/join", zValidator("query", LobbyJoinQuery), async (c) => {
    const currentLobby = c.get("lobby");
    const userId = c.get("user").id;
    const supabase = c.get("supabase");

    // Automatically leave old lobby if in one (state manager broadcasts this)
    if (currentLobby) {
      leaveLobby(userId, supabase);
    }

    const { code } = c.req.valid("query");

    const lobby = getLobbyByCode(code);
    if (!lobby) throw new HTTPException(404, { message: "lobby not found" });
    if (lobby.guestUid) throw new HTTPException(400, { message: "lobby full" });

    // State manager handles broadcasting
    joinLobby(userId, code, supabase);

    return c.json(LobbyToPayload.parse(lobby));
  })

  .post("/leave", validateLobby, async (c: Context<LobbyEnv>) => {
    const user = c.get("user");
    const supabase = c.get("supabase");

    // State manager handles broadcasting
    leaveLobby(user.id, supabase);

    return c.json(null);
  })

  .post("/start", validateLobby, async (c: Context<LobbyEnv>) => {
    const lobby = c.get("lobby");
    const user = c.get("user");
    const supabase = c.get("supabase");

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

    // State manager handles broadcasting
    startGame(lobby.code, supabase);

    return c.json(LobbyToPayload.parse(lobby));
  })

  .post("/end", validateLobby, async (c: Context<LobbyEnv>) => {
    const lobby = c.get("lobby");
    const user = c.get("user");
    const supabase = c.get("supabase");

    if (user.id !== lobby.hostUid)
      throw new HTTPException(400, {
        message: `user is not host of lobby ${lobby.code}`,
      });

    if (lobby.gameState === null)
      throw new HTTPException(400, {
        message: "lobby not started",
      });

    // State manager handles broadcasting
    endGame(lobby.code, supabase);

    return c.json(LobbyToPayload.parse(lobby));
  });

export { route as lobbies };
