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

export function createLobby(userId: string, config: LobbyConfig = { hostColor: "white" }): Lobby {
  const code = generateUniqueCode();
  const newLobby: Lobby = {
    code,
    config,
    created_at: new Date().toISOString(),
    game_state: null,
    guest_uid: null,
    host_uid: userId,
    id: randomUUIDv7(),
  };

  userIdToLobbyCode.set(userId, code);
  lobbies.set(code, newLobby);
  return newLobby;
}

export function joinLobby(userId: string, lobbyCode: string): void {
  const lobby = lobbies.get(lobbyCode)!;
  lobby.guest_uid = userId;
  userIdToLobbyCode.set(userId, lobbyCode);
}

export function leaveLobby(userId: string): void {
  const lobbyCode = userIdToLobbyCode.get(userId)!;
  const lobby = lobbies.get(lobbyCode)!;
  lobby.guest_uid = null;
  userIdToLobbyCode.delete(userId);
}

export function deleteLobby(lobbyCode: string): void {
  const lobby = lobbies.get(lobbyCode)!;
  userIdToLobbyCode.delete(lobby.host_uid);
  if (lobby.guest_uid) userIdToLobbyCode.delete(lobby.guest_uid);
  lobbies.delete(lobbyCode);
}

export function startGame(lobbyCode: string): void {
  const lobby = lobbies.get(lobbyCode)!;
  lobby.game_state = createGame();
}

export function endGame(lobbyCode: string): void {
  const lobby = lobbies.get(lobbyCode)!;
  lobby.game_state = null;
}

export function updateGameState(lobbyCode: string, gameState: AuctionChessState): void {
  const lobby = lobbies.get(lobbyCode)!;
  lobby.game_state = gameState;
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
