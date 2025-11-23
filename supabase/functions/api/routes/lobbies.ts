import { Context, Hono, MiddlewareHandler } from "hono";
import { Tables } from "../../_shared/database.types.ts";
import { supabase } from "../supabase.ts";
import { CompleteEnv, LobbyEnv } from "../types.ts";
import { generateCode } from "../utils.ts";

// Inserts a row with a unique code into "lobbies"
export async function createLobbyRow(
  config: Record<string, any> = {},
  host_uid: string
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
  next
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

const app = new Hono();

app.use(lobbyValidator);

// Need lobbies middleware. Ignore weird states for now.
app.post("", async (c: Context<LobbyEnv>) => {
  if(c.get("lobby")) return c.json({ message: "user already in lobby" }, 400)

  const lobby = await createLobbyRow({}, c.get("user").id);

  // is this needed?
  // c.set("lobby", lobby)

  return c.json(lobby);
});

app.get("", async (c: Context<LobbyEnv>) => {
  return c.json(c.get("lobby"));
});

app.post("/:code/join", async (c: Context<LobbyEnv>) => {
  if(c.get("lobby")) return c.json({ message: "user already in lobby" }, 400)

  const code = c.req.param("code");
  const { data: lobby } = await supabase
    .from("lobbies")
    .update({ guest_uid: c.get("user").id })
    .eq("code", code)
    .select()
    .maybeSingle();

  return c.json(lobby);
});

export { app as lobbies };
