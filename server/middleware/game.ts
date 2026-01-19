import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Color } from "shared/types/game";
import type { GameEnv } from "../types/honoEnvs";

export const validateGame: MiddlewareHandler<GameEnv> = async (c, next) => {
  const lobby = c.get("lobby");

  if (!lobby.gameState) {
    throw new HTTPException(400, { message: "Game not started" });
  }
  const { gameState } = lobby;
  const receivedTime = c.get("receivedTime");
  const timeUsed =
    !gameState.timeState || gameState.timeState.prev === null
      ? 0
      : receivedTime - gameState.timeState.prev;

  c.set("timeUsed", timeUsed);

  c.set("gameState", gameState);
  await next();
};

export const validatePlayer: MiddlewareHandler<GameEnv> = async (c, next) => {
  const lobby = c.get("lobby");
  const user = c.get("user");

  let playerColor: Color;

  if (user.id === lobby.hostUid) {
    playerColor = lobby.config.gameConfig.hostColor;
  } else if (user.id === lobby.guestUid) {
    playerColor =
      lobby.config.gameConfig.hostColor === "white" ? "black" : "white";
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
    throw new HTTPException(400, { message: "Not your turn" });

  await next();
};

export const recordReceivedTime: MiddlewareHandler<GameEnv> = async (
  c,
  next,
) => {
  c.set("receivedTime", Date.now());
  await next();
};

// NOTE: this middleware has the potential to explode the lobby logic.
// It mutates state in a somewhat weird way. It is responsible for catching "late moves"
// and also marking and broadcasting a game end if one is found. There are other places
// in the code that can also do the same, so the state must be managed very carefully.
export const validateTime: MiddlewareHandler<GameEnv> = async (c, next) => {
  const gameState = c.get("gameState");
  const timeUsed = c.get("timeUsed");


  if (
    gameState.timeState &&
    timeUsed > gameState.timeState.time[gameState.turn]
  ) {
    console.log({timeUsed, time: gameState.timeState.time});

    throw new HTTPException(400, { message: "Move came after timeout." });
  }

  await next();
};
