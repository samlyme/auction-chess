import type { AuctionChessState, Lobby, LobbyConfig } from "shared";
import { randomUUIDv7 } from "bun";
import { createGame } from "shared/game/auctionChess";

const lobbies = new Map<string, Lobby>();
const userIdToLobbyCode = new Map<string, string>();

export function getLobbyByCode(lobbyCode: string): Lobby | undefined {
  return lobbies.get(lobbyCode);
}

export function getLobbyByUserId(userId: string): Lobby | undefined {
  const lobbyCode = userIdToLobbyCode.get(userId);
  return lobbyCode ? lobbies.get(lobbyCode) : undefined;
}

export function createLobby(
  userId: string,
  config: LobbyConfig,
): Lobby {
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

  userIdToLobbyCode.set(userId, code);
  lobbies.set(code, newLobby);
  return newLobby;
}

export function joinLobby(userId: string, lobbyCode: string): void {
  const lobby = lobbies.get(lobbyCode)!;
  lobby.guestUid = userId;
  userIdToLobbyCode.set(userId, lobbyCode);
}

export function leaveLobby(userId: string): void {
  const lobbyCode = userIdToLobbyCode.get(userId)!;
  const lobby = lobbies.get(lobbyCode)!;
  lobby.guestUid = null;
  userIdToLobbyCode.delete(userId);
}

export function deleteLobby(lobbyCode: string): void {
  const lobby = lobbies.get(lobbyCode)!;
  userIdToLobbyCode.delete(lobby.hostUid);
  if (lobby.guestUid) userIdToLobbyCode.delete(lobby.guestUid);
  lobbies.delete(lobbyCode);
}

export function startGame(lobbyCode: string): void {
  const lobby = lobbies.get(lobbyCode)!;
  lobby.gameState = createGame(lobby.config.gameConfig);
}

export function endGame(lobbyCode: string): void {
  const lobby = lobbies.get(lobbyCode)!;
  lobby.gameState = null;
}

export function updateGameState(
  lobbyCode: string,
  gameState: AuctionChessState,
): void {
  const lobby = lobbies.get(lobbyCode)!;
  lobby.gameState = gameState;
}

function generateUniqueCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 100; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (!lobbies.has(code)) return code;
  }
  throw new Error("Failed to generate unique lobby code");
}
