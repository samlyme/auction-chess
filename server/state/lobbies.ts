import type { AuctionChessState, Lobby, LobbyConfig } from "shared";
import { randomUUIDv7 } from "bun";
import { createGame } from "shared/game/auctionChess";
import type { SupabaseClient } from "@supabase/supabase-js";
import { broadcastLobbyDelete, broadcastLobbyUpdate } from "../utils/realtime.ts";

const lobbies: Record<string, Lobby> = {};
const userIdToLobbyCode: Record<string, string> = {};

export function getLobbyByCode(lobbyCode: string): Lobby | undefined {
  return lobbies[lobbyCode];
}

export function getLobbyByUserId(userId: string): Lobby | undefined {
  const lobbyCode = userIdToLobbyCode[userId];
  return lobbyCode ? lobbies[lobbyCode] : undefined;
}

export function createLobby(
  userId: string,
  config: LobbyConfig,
  supabase: SupabaseClient,
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

  userIdToLobbyCode[userId] = code;
  lobbies[code] = newLobby;

  // Broadcast the new lobby
  const channel = supabase.channel(`lobby-${code}`);
  broadcastLobbyUpdate(channel, newLobby);

  return newLobby;
}

export function joinLobby(userId: string, lobbyCode: string, supabase: SupabaseClient): void {
  if (userId in userIdToLobbyCode) {
    leaveLobby(userId, supabase);
  }
  const lobby = lobbies[lobbyCode]!;
  lobby.guestUid = userId;
  userIdToLobbyCode[userId] = lobbyCode;

  // Broadcast the updated lobby
  const channel = supabase.channel(`lobby-${lobbyCode}`);
  broadcastLobbyUpdate(channel, lobby);
}

export function leaveLobby(userId: string, supabase: SupabaseClient): void {
  const lobbyCode = userIdToLobbyCode[userId];
  if (!lobbyCode) return;

  const lobby = lobbies[lobbyCode]!;
  const channel = supabase.channel(`lobby-${lobbyCode}`);

  if (userId === lobby.hostUid) {
    if (lobby.guestUid) {
      lobby.hostUid = lobby.guestUid;
      lobby.guestUid = null;
      delete userIdToLobbyCode[userId];
      // Broadcast the updated lobby (guest is now host)
      broadcastLobbyUpdate(channel, lobby);
    } else {
      // No guest, so delete the lobby
      return deleteLobby(lobbyCode, supabase);
    }
  } else if (userId === lobby.guestUid) {
    lobby.guestUid = null;
    delete userIdToLobbyCode[userId];
    // Broadcast the updated lobby (guest left)
    broadcastLobbyUpdate(channel, lobby);
  }
}

export function deleteLobby(lobbyCode: string, supabase: SupabaseClient): void {
  const lobby = lobbies[lobbyCode]!;

  // Broadcast deletion before removing from state
  const channel = supabase.channel(`lobby-${lobbyCode}`);
  broadcastLobbyDelete(channel);

  delete userIdToLobbyCode[lobby.hostUid];
  if (lobby.guestUid) delete userIdToLobbyCode[lobby.guestUid];
  delete lobbies[lobbyCode];
}

export function startGame(lobbyCode: string, supabase: SupabaseClient): void {
  const lobby = lobbies[lobbyCode]!;
  lobby.gameState = createGame(lobby.config.gameConfig);

  // Broadcast the updated lobby with game state
  const channel = supabase.channel(`lobby-${lobbyCode}`);
  broadcastLobbyUpdate(channel, lobby);
}

export function endGame(lobbyCode: string, supabase: SupabaseClient): void {
  const lobby = lobbies[lobbyCode]!;
  lobby.gameState = null;

  // Broadcast the updated lobby with null game state
  const channel = supabase.channel(`lobby-${lobbyCode}`);
  broadcastLobbyUpdate(channel, lobby);
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
