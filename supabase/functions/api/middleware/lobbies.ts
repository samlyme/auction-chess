import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

import { LobbyEnv, MaybeLobbyEnv } from "../types.ts";
import { supabase } from "../supabase.ts";

export const getLobby = async (c: Context<MaybeLobbyEnv>, next: Next) => {
  const { data: lobby } = await supabase
    .from("lobbies")
    .select("*")
    .or(`host_uid.eq.${c.get("user").id},guest_uid.eq.${c.get("user").id}`)
    .maybeSingle();

  c.set("lobby", lobby);

  await next();
};

export const validateLobby = async (c: Context<LobbyEnv>, next: Next) => {
  const lobby = c.get("lobby");

  if (!lobby) throw new HTTPException(400, { message: "user not in lobby" });

  c.set("channel", supabase.channel(`lobby-${lobby.code}`));
  c.set("deleted", false);
  await next();
};

// NOTE: Misleading, but this is a handler LOL!!!!
export const broadcastLobby = (c: Context<LobbyEnv>) => {
  const lobby = c.get("lobby");
  const channel = c.get("channel");
  const deleted = c.get("deleted");

  channel.httpSend("lobby-update", deleted ? { deleted } : lobby);

  return c.json(lobby);
};
