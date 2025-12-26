import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Color } from "shared";
import type { GameEnv } from "../types/honoEnvs.ts";

export const validateGame: MiddlewareHandler<GameEnv> = async (c, next) => {
  const lobby = c.get("lobby");

  if (!lobby.gameState) {
    throw new HTTPException(400, { message: "Game not started" });
  }

  c.set("gameState", lobby.gameState);
  await next();
};

export const validatePlayer: MiddlewareHandler<GameEnv> = async (c, next) => {
  const lobby = c.get("lobby");
  const user = c.get("user");

  let playerColor: Color;

  if (user.id === lobby.hostUid) {
    playerColor = lobby.config.hostColor;
  } else if (user.id === lobby.guestUid) {
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
};
