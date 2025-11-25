// deno-lint-ignore-file no-explicit-any
import { Context, Hono, MiddlewareHandler } from "hono";
import { Tables } from "shared";
import { supabase } from "../supabase.ts";
import { generateCode } from "../utils.ts";
import { LobbyEnv } from "../types.ts";
import { profileValidator } from "../middleware/profiles.ts";

// Inserts a row with a unique code into "lobbies"
export async function createLobbyRow(
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

  throw new Error("Failed to generate unique lobby code after many tries");
}

const lobbyValidator: MiddlewareHandler<LobbyEnv> = async (
  c: Context<LobbyEnv>,
  next,
) => {
  // Don't worry about extreme panick states like them being a host and a guest

  const { data: lobby } = await supabase
    .from("lobbies")
    .select("*")
    .or(`host_uid.eq.${c.get("user").id},guest_uid.eq.${c.get("user").id}`)
    .maybeSingle();

  c.set("lobby", lobby);

  await next();
};

const app = new Hono<LobbyEnv>();

app.use(profileValidator);
app.use(lobbyValidator);

// Need lobbies middleware. Ignore weird states for now.
app.post("", async (c: Context<LobbyEnv>) => {
  if (c.get("lobby")) return c.json({ message: "user already in lobby" }, 400);

  const lobby = await createLobbyRow({}, c.get("user").id);

  // is this needed?
  // c.set("lobby", lobby)

  return c.json(lobby);
});

app.get("", (c: Context<LobbyEnv>) => {
  return c.json(c.get("lobby"));
});

app.delete("/:code", async (c: Context<LobbyEnv>) => {
  const lobby = c.get("lobby");
  if (!lobby) return c.status(400);

  const code = c.req.param("code");
  if (lobby.code !== code) return c.status(400);

  const user = c.get("user");
  if (user.id !== lobby.host_uid) return c.status(400);

  const { data, error } = await supabase
    .from("lobbies")
    .delete()
    .eq("code", code)
    .select()
    .single();
  if (error) return c.json(error, 500);

  return c.json(data);
});

app.post("/:code/join", async (c: Context<LobbyEnv>) => {
  if (c.get("lobby")) return c.json({ message: "user already in lobby" }, 400);

  const code = c.req.param("code");
  // TODO: check if lobby is full
  const { data: lobby } = await supabase
    .from("lobbies")
    .update({ guest_uid: c.get("user").id })
    .eq("code", code)
    .select()
    .maybeSingle();

  return c.json(lobby);
});

app.post("/:code/leave", async (c: Context<LobbyEnv>) => {
  const lobby = c.get("lobby");
  if (!lobby) return c.json({ message: "user not in lobby" }, 400);

  // TODO: make remove code from param
  const code = c.req.param("code");
  if (code !== lobby.code)
    return c.json({ message: `user in other lobby, not in lobby ${code}` });

  const user = c.get("user");
  if (user.id !== lobby.guest_uid)
    return c.json({ message: `user is not guest in lobby ${code}` });

  const { data } = await supabase
    .from("lobbies")
    .update({ guest_uid: null })
    .eq("code", code)
    .select()
    .maybeSingle();

  return c.json(data);
});

export { app as lobbies };
