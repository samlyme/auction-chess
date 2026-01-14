import type { LobbyConfig, LobbyPayload } from 'shared';
import { api } from '@/services/api';
import { parseResponse } from 'hono/client';

export async function createLobby(
  lobbyConfig: LobbyConfig
): Promise<LobbyPayload> {
  return await parseResponse(api.lobbies.$post({ json: lobbyConfig }));
}

export async function getLobby(): Promise<LobbyPayload | null> {
  return await parseResponse(api.lobbies.$get());
}

export async function deleteLobby(): Promise<null> {
  return await parseResponse(api.lobbies.$delete());
}

export async function joinLobby(code: string): Promise<LobbyPayload> {
  return await parseResponse(api.lobbies.join.$post({ query: { code } }));
}

export async function leaveLobby(): Promise<LobbyPayload | null> {
  return await parseResponse(api.lobbies.leave.$post());
}

export async function startLobby(): Promise<LobbyPayload> {
  return await parseResponse(api.lobbies.start.$post());
}

export async function endLobby(): Promise<LobbyPayload> {
  return await parseResponse(api.lobbies.end.$post());
}
