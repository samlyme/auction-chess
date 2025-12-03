import { type Context, Hono, type Next } from "hono";
import { AuctionChessState, Lobby, LobbyJoinQuery } from "shared";
import type { LobbyEnv, MaybeLobbyEnv } from "../types.ts";
import { getProfile, validateProfile } from "../middleware/profiles.ts";
import {
  broadcastLobby,
  getLobby,
  validateLobby,
} from "../middleware/lobbies.ts";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { createLobbyRow } from "../utils.ts";
import { createGame } from "shared/game/auctionChess.ts";

const app = new Hono<MaybeLobbyEnv>();
// could be a perf bottleneck since we are getting their profile on each req.
app.use(getProfile, validateProfile);
app.use(getLobby);

app.post(
  "/",
  async (c: Context<MaybeLobbyEnv>, next: Next) => {
    const supabase = c.get("supabase");
    if (c.get("lobby"))
      throw new HTTPException(400, { message: "user already in lobby" });

    const lobby = await createLobbyRow(supabase, c.get("user").id);
    c.set("lobby", lobby as Lobby); // is it worth to use zod to check here?

    await next();
  },
  validateLobby,
  broadcastLobby,
);

app.get("", (c: Context<MaybeLobbyEnv>) => {
  const lobby = c.get("lobby");
  return c.json(lobby);
});

app.delete(
  "/",
  validateLobby,
  async (c: Context<LobbyEnv>, next) => {
    const supabase = c.get("supabase");
    const lobby = c.get("lobby");
    console.log("delete route", { lobby });

    const user = c.get("user");
    if (user.id !== lobby.host_uid)
      throw new HTTPException(401, {
        message: `You are not the host of lobby ${lobby.code}`,
      });

    const { error } = await supabase
      .from("lobbies")
      .delete()
      .eq("code", lobby.code)
      .single();
    if (error)
      throw new HTTPException(500, {
        message: `DB failed to delete lobby ${lobby.code}`,
      });

    c.set("deleted", true);

    await next();
  },
  broadcastLobby,
);

// TODO: use http exceptions here
app.post(
  "/join",
  zValidator("query", LobbyJoinQuery),
  async (c, next) => {
    const supabase = c.get("supabase");
    if (c.get("lobby"))
      throw new HTTPException(400, { message: "user already in lobby" });

    // THIS line is haunted lmfao
    const { code } = (c.req as any).valid("query");

    const { data: lobbyState } = await supabase
      .from("lobbies")
      .select("guest_uid")
      .eq("code", code)
      .single();

    if (lobbyState?.guest_uid)
      throw new HTTPException(400, { message: "lobby is full" });

    const { data: lobby } = await supabase
      .from("lobbies")
      .update({ guest_uid: c.get("user").id })
      .eq("code", code)
      .select()
      .maybeSingle();

    c.set("lobby", lobby);

    await next();
  },
  validateLobby,
  broadcastLobby,
);

app.post(
  "/leave",
  validateLobby,
  async (c: Context<LobbyEnv>, next) => {
    const supabase = c.get("supabase");
    const lobby = c.get("lobby");

    const user = c.get("user");
    if (user.id !== lobby.guest_uid)
      throw new HTTPException(400, {
        message: `user is not guest in lobby ${lobby.code}`,
      });

    const { data: newLobby } = await supabase
      .from("lobbies")
      .update({ guest_uid: null })
      .eq("code", lobby.code)
      .select()
      .maybeSingle();

    c.set("lobby", newLobby);

    await next();
  },
  broadcastLobby,
);

app.post(
  "/start",
  validateLobby,
  async (c: Context<LobbyEnv>, next) => {
    const supabase = c.get("supabase");
    const lobby = c.get("lobby");
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
    const defaultGameState: AuctionChessState = createGame();

    const { data: updatedLobby, error } = await supabase
      .from("lobbies")
      .update({ game_state: defaultGameState })
      .eq("code", lobby.code)
      .select()
      .single();

    if (error)
      throw new HTTPException(500, {
        message: `Failed to start lobby ${lobby.code}`,
      });

    c.set("lobby", updatedLobby);

    await next();
  },
  broadcastLobby,
);

app.post(
  "/end",
  validateLobby,
  async (c: Context<LobbyEnv>, next) => {
    const supabase = c.get("supabase");
    const lobby = c.get("lobby");
    const user = c.get("user");

    if (user.id !== lobby.host_uid)
      throw new HTTPException(400, {
        message: `user is not host of lobby ${lobby.code}`,
      });

    if (lobby.game_state === null)
      throw new HTTPException(400, {
        message: "lobby not started",
      });


    const { data: updatedLobby, error } = await supabase
      .from("lobbies")
      .update({ game_state: null })
      .eq("code", lobby.code)
      .select()
      .single();

    if (error)
      throw new HTTPException(500, {
        message: `Failed to end lobby ${lobby.code}`,
      });

    c.set("lobby", updatedLobby);

    await next();
  },
  broadcastLobby,
);


export { app as lobbies };
