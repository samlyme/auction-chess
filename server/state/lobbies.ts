import type { AuctionChessState, Lobby, LobbyConfig } from "shared/types";
import { randomUUIDv7 } from "bun";
import { createGame } from "shared/game/auctionChess";

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
  const code = generateUniqueCode();
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
  console.log("new game state", gameState);
}

function generateUniqueCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 100; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (!(code in lobbies)) return code;
  }
  throw new Error("Failed to generate unique lobby code");
}
