import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Color } from "shared";
import type { GameEnv } from "../types.ts";
import { measureMiddleware } from "./performance.ts";

const validateGameImpl: MiddlewareHandler<GameEnv> = async (c, next) => {
  const lobby = c.get("lobby");

  if (!lobby.game_state) {
    throw new HTTPException(400, { message: "Game not started" });
  }

  c.set("gameState", lobby.game_state);
  await next();
};

const validatePlayerImpl: MiddlewareHandler<GameEnv> = async (c, next) => {
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

const validateTurnImpl: MiddlewareHandler<GameEnv> = async (c, next) => {
  const gameState = c.get("gameState");
  const playerColor = c.get("playerColor");

  if (playerColor !== gameState.turn)
    throw new HTTPException(400, {message: "Not your turn"});

  await next();
};

export const validateGame = measureMiddleware(validateGameImpl, "Validate Game");
export const validatePlayer = measureMiddleware(validatePlayerImpl, "Validate Player");
export const validateTurn = measureMiddleware(validateTurnImpl, "Validate Turn");
