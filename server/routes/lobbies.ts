import { type Context, Hono, type Next } from "hono";
import { AuctionChessState, Lobby, LobbyJoinQuery, LobbyToPayload } from "shared";
import type { LobbyEnv, MaybeLobbyEnv } from "../types.ts";
import { getProfile, validateProfile } from "../middleware/profiles.ts";
import { getLobby, validateLobby } from "../middleware/lobbies.ts";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { createLobbyRow } from "../utils.ts";
import { createGame } from "shared/game/auctionChess.ts";
import { broadcastLobbyUpdate } from "../utils/realtime.ts";

const app = new Hono<MaybeLobbyEnv>();
// could be a perf bottleneck since we are getting their profile on each req.
app.use(getProfile, validateProfile);
app.use(getLobby);

app.post("/", async (c: Context<MaybeLobbyEnv>) => {
  const supabase = c.get("supabase");
  if (c.get("lobby"))
    throw new HTTPException(400, { message: "user already in lobby" });

  const lobby = await createLobbyRow(supabase, c.get("user").id) as Lobby;
  const channel = supabase.channel(`lobby-${lobby.code}`);

  const payload = broadcastLobbyUpdate(channel, lobby);
  return c.json(payload);
});

app.get("", (c: Context<MaybeLobbyEnv>) => {
  const lobby = c.get("lobby");
  return c.json(lobby ? LobbyToPayload.parse(lobby) : null);
});

app.delete("/", validateLobby, async (c: Context<LobbyEnv>) => {
  const supabase = c.get("supabase");
  const lobby = c.get("lobby");
  const channel = c.get("channel");
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

  const payload = broadcastLobbyUpdate(channel, null, true);
  return c.json(payload);
});

app.post(
  "/join",
  zValidator("query", LobbyJoinQuery),
  async (c: Context<MaybeLobbyEnv>) => {
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

    if (!lobby)
      throw new HTTPException(404, { message: "lobby not found" });

    const channel = supabase.channel(`lobby-${lobby.code}`);
    const payload = broadcastLobbyUpdate(channel, lobby);
    return c.json(payload);
  },
);

app.post("/leave", validateLobby, async (c: Context<LobbyEnv>) => {
  const supabase = c.get("supabase");
  const lobby = c.get("lobby");
  const channel = c.get("channel");

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

  console.log("person left", newLobby);

  const payload = broadcastLobbyUpdate(channel, newLobby);
  return c.json(payload);
});

app.post("/start", validateLobby, async (c: Context<LobbyEnv>) => {
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

  const payload = broadcastLobbyUpdate(channel, updatedLobby);
  return c.json(payload);
});

app.post("/end", validateLobby, async (c: Context<LobbyEnv>) => {
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

  const payload = broadcastLobbyUpdate(channel, updatedLobby);
  return c.json(payload);
});

export { app as lobbies };
