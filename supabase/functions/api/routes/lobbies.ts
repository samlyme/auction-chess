import { type Context, Hono, type Next } from "hono";
import { LobbyJoinQuery, type Tables } from "shared";
import { supabase } from "../supabase.ts";
import { generateCode } from "../utils.ts";
import type { LobbyEnv, MaybeLobbyEnv } from "../types.ts";
import { getProfile, validateProfile } from "../middleware/profiles.ts";
import {
  broadcastLobby,
  getLobby,
  validateLobby,
} from "../middleware/lobbies.ts";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";

// Inserts a row with a unique code into "lobbies"
export async function createLobbyRow(
  // deno-lint-ignore no-explicit-any
  config: Record<string, any> = {},
  host_uid: string,
): Promise<Tables<"lobbies">> {
  const MAX_ATTEMPTS = 10;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const code = generateCode();

    const { data: existing, error: lookupError } = await supabase
      .from("lobbies")
      .select("code")
      .eq("code", code)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (existing) continue; // code taken — retry

    const { data: inserted, error } = await supabase
      .from("lobbies")
      .insert({ code, config, host_uid })
      .select()
      .single();

    if (!error) return inserted;
    if (error.code !== "23505") throw error; // only retry on unique constraint violation
  }

  throw new HTTPException(500, {
    message: "Failed to generate unique lobby code after many tries",
  });
}

const app = new Hono<MaybeLobbyEnv>();
// could be a perf bottleneck since we are getting their profile on each req.
app.use(getProfile, validateProfile);
app.use(getLobby);

// Need lobbies middleware. Ignore weird states for now.
app.post(
  "",
  async (c: Context<MaybeLobbyEnv>, next: Next) => {
    if (c.get("lobby"))
      throw new HTTPException(400, { message: "user already in lobby" });

    const lobby = await createLobbyRow({}, c.get("user").id);
    c.set("lobby", lobby);

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

app.post("/start", validateLobby, async (c: Context<LobbyEnv>, next) => {
  const lobby = c.get("lobby");
  const user = c.get("user");
  if (user.id !== lobby.host_uid)
    throw new HTTPException(400, {
      message: `user is not host of lobby ${lobby.code}`,
    });


});

export { app as lobbies };
