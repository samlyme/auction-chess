import type { Handler, MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { LobbyEventType, type Color } from "shared";
import type { GameEnv, LobbyEnv } from "../types.ts";

export const validateGame: MiddlewareHandler<GameEnv> = async (c, next) => {
  const lobby = c.get("lobby");

  if (!lobby.game_state) {
    throw new HTTPException(400, { message: "Game not started" });
  }

  c.set("gameState", lobby.game_state);
  await next();
};

// TODO: broadcast game event.
export const validatePlayer: MiddlewareHandler<GameEnv> = async (c, next) => {
  const lobby = c.get("lobby");
  const user = c.get("user");

  let playerColor: Color;

  if (user.id === lobby.host_uid) {
    playerColor = lobby.config.hostColor;
  } else if (user.id === lobby.guest_uid) {
    playerColor = lobby.config.hostColor === "white" ? "black" : "white";
  } else {
    throw new HTTPException(403, { message: "Not a player in this game" });
  }

  c.set("playerColor", playerColor);
  await next();
};

export const validateTurn: MiddlewareHandler<GameEnv> = async (c, next) => {
  const gameState = c.get("gameState");
  const playerColor = c.get("playerColor");

  if (playerColor !== gameState.turn)
    throw new HTTPException(400, {message: "Not your turn"});

  await next();
}
