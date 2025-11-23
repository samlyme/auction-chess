import "@supabase/functions-js";
import { createClient, User } from "@supabase/supabase-js";
import { Context, Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";
import { corsHeaders } from "../_shared/cors.ts";

import { Tables } from "../_shared/database.types.ts"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const app = new Hono().basePath("/api");

// successful log in. 
type AuthedEnv = {
  Variables: {
    user: User
  }
}
// Their profile is complete.
type CompleteEnv = {
  Variables: AuthedEnv["Variables"] & { profile: Tables<'profiles'> }
}
app.use(
  cors({
    origin: corsHeaders["Access-Control-Allow-Origin"],
    allowHeaders: corsHeaders["Access-Control-Allow-Headers"],
  })
);

app.use(
  bearerAuth({
    verifyToken: async (token, c) => {
      // Verify token by calling Supabase Auth API
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) return false; // invalid token
      c.set("user", data.user); // optionally store user in context
      return true;
    },
  })
);

app.use(async (c: Context<CompleteEnv>, next) => {
  const user = c.get("user");
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  if (error) return c.json({ message: "no profile" }, 400);
  c.set('profile', data);
  await next();
});

// Utility to make a 5-char random code, e.g. “A9X2F”
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // skip O/0/I/1 for clarity
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Inserts a row with a unique code into "lobbies"
export async function createLobbyRow(config: Record<string, any> = {}, host_uid: string): Promise<Tables<'lobbies'>> {
  const MAX_ATTEMPTS = 10

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const code = generateCode()

    const { data: existing, error: lookupError } = await supabase
      .from('lobbies')
      .select('code')
      .eq('code', code)
      .maybeSingle()

    if (lookupError) throw lookupError
    if (existing) continue // code taken — retry

    const { data: inserted, error } = await supabase
      .from('lobbies')
      .insert({ code, config, host_uid})
      .select()
      .single()

    if (!error) return inserted
    if (error.code !== '23505') throw error // only retry on unique constraint violation
  }

  throw new Error('Failed to generate unique lobby code after many tries')
}


// Need lobbies middleware. Ignore weird states for now.
app.post("/lobbies", async (c: Context<CompleteEnv>) => {
  const lobby = await createLobbyRow({}, c.get('user').id);
  return c.json(lobby);
})

app.get("/lobbies", async (c: Context<CompleteEnv>) => {
  const { data: hostLobby } = await supabase
    .from('lobbies')
    .select("*")
    .eq("host_uid", c.get("user").id)
    .single();

  if (hostLobby) return c.json(hostLobby);

  const { data: guestLobby } = await supabase
    .from('lobbies')
    .select("*")
    .eq("guest_uid", c.get("user").id)
    .single();

  if (guestLobby) return c.json(guestLobby);

  return c.json({});
})

app.post("/lobbies/:code/join", async (c: Context<CompleteEnv>) => {
  const code = c.req.param("code");
  const { data: lobby } = await supabase
    .from('lobbies')
    .update({"guest_uid": c.get('user').id})
    .eq("code", code)
    .select()

  return c.json(lobby)
})

Deno.serve(app.fetch)