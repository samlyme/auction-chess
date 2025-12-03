import type { SupabaseClient } from "@supabase/supabase-js";
import { HTTPException } from "hono/http-exception";
import type { Database, LobbyConfig, Tables } from "shared";

export function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // skip O/0/I/1 for clarity
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Inserts a row with a unique code into "lobbies"
export async function createLobbyRow(
  supabase: SupabaseClient<Database>,
  host_uid: string,
  config: LobbyConfig = { hostColor: "white" },
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

