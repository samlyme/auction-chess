import type { Lobby, LobbyConfig } from "shared";
import { randomUUIDv7 } from "bun";
import { createGame } from "shared/game/auctionChess";

// TODO: use result type
const lobbies = new Map<string, Lobby>();
const userIdToLobbyCode = new Map<string, string>();

export function getLobby(userId: string): Lobby | null {
  const lobbyCode = userIdToLobbyCode.get(userId);
  if (!lobbyCode) return null;
  const lobby = lobbies.get(lobbyCode);
  if (!lobby) throw new Error("Invalid lobby state");
  return lobby
}

export function createLobby(userId: string, config: LobbyConfig = { hostColor: "white" }): Lobby | null {
  console.log("createLobby");

  if (userIdToLobbyCode.has(userId)) return null;

  for (let i = 0; i < 10; i++) {
    const code = generateCode();
    if (lobbies.has(code)) continue;

    const newLobby: Lobby = {
      code,
      config,
      created_at: (new Date()).toISOString(),
      game_state: null,
      guest_uid: null,
      host_uid: userId,
      id: randomUUIDv7()
    }
    userIdToLobbyCode.set(userId, code);
    lobbies.set(code, newLobby);
    console.log({lobbies, userIdToLobbyCode});

    return newLobby;
  }

  return null;
}

export function joinLobby(userId: string, lobbyCode: string): Lobby | null {
  console.log("joinLobby");
  if (userIdToLobbyCode.has(userId)) return null;

  const lobby = lobbies.get(lobbyCode);
  if (!lobby || lobby.guest_uid) return null;

  userIdToLobbyCode.set(userId, lobbyCode);
  lobby.guest_uid = userId;
  console.log({lobbies, userIdToLobbyCode});
  // DO NOT MUTATE LOL!!!
  return lobby;
}

export function leaveLobby(userId: string, lobbyCode: string): Lobby | null {
  console.log("leaveLobby");

  if (!userIdToLobbyCode.has(userId)) return null;

  const lobby = lobbies.get(lobbyCode);
  if (!lobby || !lobby.guest_uid) return null;
  if (userId !== lobby.guest_uid) return null;

  userIdToLobbyCode.delete(userId);
  lobby.guest_uid = null;
  console.log({lobbies, userIdToLobbyCode});
  return lobby;
}

export function deleteLobby(userId: string, lobbyCode: string): boolean {
  if (!userIdToLobbyCode.has(userId)) return false;

  const lobby = lobbies.get(lobbyCode);
  if (!lobby) return false;
  if (userId !== lobby.host_uid) return false;

  const host = lobby.host_uid;
  userIdToLobbyCode.delete(host);

  const guest = lobby.guest_uid;
  if (guest) userIdToLobbyCode.delete(guest);

  lobbies.delete(lobbyCode);

  return true;
}

export function startLobby(userId: string, lobbyCode: string): Lobby | null {
  if (!userIdToLobbyCode.has(userId)) return null;

  const lobby = lobbies.get(lobbyCode);
  if (!lobby) return null;
  if (userId !== lobby.host_uid) return null;

  // Initialize default game state for Auction Chess

  lobby.game_state = createGame();
  return lobby;
}

export function endLobby(userId: string, lobbyCode: string): Lobby | null {
  if (!userIdToLobbyCode.has(userId)) return null;

  const lobby = lobbies.get(lobbyCode);
  if (!lobby) return null;
  if (userId !== lobby.host_uid) return null;

  // Initialize default game state for Auction Chess

  lobby.game_state = null;
  return lobby;
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // skip O/0/I/1 for clarity
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
