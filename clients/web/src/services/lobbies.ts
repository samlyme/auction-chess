import type { LobbyConfig, LobbyPayload, Result } from "shared";
import { api } from "./api";
import { handleApiCall } from "./utils";

export async function createLobby(
  lobbyConfig: LobbyConfig,
): Promise<Result<LobbyPayload>> {
  return handleApiCall(() => api.api.lobbies.$post({ json: lobbyConfig }));
}

export async function getLobby(): Promise<Result<LobbyPayload | null>> {
  return handleApiCall(() => api.api.lobbies.$get());
}

export async function deleteLobby(): Promise<Result<null>> {
  return handleApiCall(() => api.api.lobbies.$delete());
}

export async function joinLobby(code: string): Promise<Result<LobbyPayload>> {
  return handleApiCall(() => api.api.lobbies.join.$post({ query: { code } }));
}

export async function leaveLobby(): Promise<Result<LobbyPayload | null>> {
  return handleApiCall(() => api.api.lobbies.leave.$post());
}

export async function startLobby(): Promise<Result<LobbyPayload>> {
  return handleApiCall(() => api.api.lobbies.start.$post());
}

export async function endLobby(): Promise<Result<LobbyPayload>> {
  return handleApiCall(() => api.api.lobbies.end.$post());
}
