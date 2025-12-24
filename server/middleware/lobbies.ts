import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

import type { LobbyEnv, MaybeLobbyEnv } from "../types.ts";
import { endTime, startTime } from "hono/timing";

export const getLobby: MiddlewareHandler<MaybeLobbyEnv> = async (c, next) => {
  const supabase = c.get("supabase");

  startTime(c, "getLobby");

  const { data: lobby } = await supabase
    .from("lobbies")
    .select("*")
    .or(`host_uid.eq.${c.get("user").id},guest_uid.eq.${c.get("user").id}`)
    .single();

  endTime(c, "getLobby");

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
