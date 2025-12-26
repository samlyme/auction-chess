import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

import type { LobbyEnv, MaybeLobbyEnv } from "../types/honoEnvs.ts";
import { endTime, startTime } from "hono/timing";

import * as Lobbies from "../state/lobbies.ts"

export const getLobby: MiddlewareHandler<MaybeLobbyEnv> = async (c, next) => {
  startTime(c, "getLobby");

  const lobby = Lobbies.getLobbyByUserId(c.get("user").id);

  endTime(c, "getLobby");

  c.set("lobby", lobby || undefined);

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
