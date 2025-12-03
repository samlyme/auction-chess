import type { Handler, MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

import type { LobbyEnv, MaybeLobbyEnv } from "../types.ts";
import { LobbyEventType } from "shared";

export const getLobby: MiddlewareHandler<MaybeLobbyEnv> = async (c, next) => {
  const supabase = c.get("supabase");
  const { data: lobby } = await supabase
    .from("lobbies")
    .select("*")
    .or(`host_uid.eq.${c.get("user").id},guest_uid.eq.${c.get("user").id}`)
    .maybeSingle();

  c.set("lobby", lobby);

  await next();
};

export const validateLobby: MiddlewareHandler<LobbyEnv> = async (c, next) => {
  const lobby = c.get("lobby");
  const supabase = c.get("supabase");

  if (!lobby) throw new HTTPException(400, { message: "user not in lobby" });

  c.set("channel", supabase.channel(`lobby-${lobby.code}`));
  c.set("deleted", false);
  await next();
};

// NOTE: Misleading, but this is a handler LOL!!!!
export const broadcastLobby: Handler<LobbyEnv> = async (c) => {
  const lobby = c.get("lobby");
  const channel = c.get("channel");
  const deleted = c.get("deleted");

  if (deleted) {
    channel.httpSend(LobbyEventType.Delete, null);
    return c.json(null)
  }
  else {
    channel.httpSend(LobbyEventType.Update, lobby);
    return c.json(lobby);
  }
};
