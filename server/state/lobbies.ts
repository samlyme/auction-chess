import { randomUUIDv7 } from "bun";
import type { AuctionChessState } from "shared/types/game";
import type { Lobby, LobbyConfig } from "shared/types/lobbies";
import {createGame} from "shared/game/auctionChess"
import { generateUniqueCode } from "../utils/unique";

const lobbies: Record<string, Lobby> = {};
const userIdToLobbyCode: Record<string, string> = {};

export function getLobbyByCode(lobbyCode: string): Lobby | undefined {
  return lobbies[lobbyCode];
}

export function getLobbyByUserId(userId: string): Lobby | undefined {
  const lobbyCode = userIdToLobbyCode[userId];
  return lobbyCode ? lobbies[lobbyCode] : undefined;
}

export function createLobby(userId: string, config: LobbyConfig): Lobby {
  const code = generateUniqueCode(lobbies);
  const newLobby: Lobby = {
    code,
    config,
    createdAt: new Date().toISOString(),
    gameState: null,
    guestUid: null,
    hostUid: userId,
    id: randomUUIDv7(),
  };

  userIdToLobbyCode[userId] = code;
  lobbies[code] = newLobby;
  return newLobby;
}

export function updateLobbyConfig(lobbyCode: string, config: LobbyConfig): void {
  const lobby = lobbies[lobbyCode]!;
  lobby.config = config;
}

export function joinLobby(userId: string, lobbyCode: string): void {
  const lobby = lobbies[lobbyCode]!;
  lobby.guestUid = userId;
  userIdToLobbyCode[userId] = lobbyCode;
}

export function leaveLobby(userId: string): void {
  const lobbyCode = userIdToLobbyCode[userId]!;
  const lobby = lobbies[lobbyCode]!;
  lobby.guestUid = null;
  delete userIdToLobbyCode[userId];
}

export function deleteLobby(lobbyCode: string): void {
  const lobby = lobbies[lobbyCode]!;
  delete userIdToLobbyCode[lobby.hostUid];
  if (lobby.guestUid) delete userIdToLobbyCode[lobby.guestUid];
  delete lobbies[lobbyCode];
}

export function startGame(lobbyCode: string): void {
  const lobby = lobbies[lobbyCode]!;
  lobby.gameState = createGame(lobby.config.gameConfig);
}

export function endGame(lobbyCode: string): void {
  const lobby = lobbies[lobbyCode]!;
  lobby.gameState = null;
}

export function updateGameState(
  lobbyCode: string,
  gameState: AuctionChessState,
): void {
  const lobby = lobbies[lobbyCode]!;
  lobby.gameState = gameState;
}
