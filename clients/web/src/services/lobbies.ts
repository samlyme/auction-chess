import type { LobbyPayload } from "shared";
import { api } from "./api";

export async function createLobby(): Promise<LobbyPayload> {
  const res = await api.api.lobbies.$post();
  return res.json();
}

export async function getLobby(): Promise<LobbyPayload | null> {
  const res = await api.api.lobbies.$get();
  return res.json();
}

export async function deleteLobby(): Promise<null> {
  const res = await api.api.lobbies.$delete();
  return res.json();
}

export async function joinLobby(code: string): Promise<LobbyPayload> {
  const res = await api.api.lobbies.join.$post({ query: { code } });
  return res.json();
}

export async function leaveLobby(): Promise<LobbyPayload | null> {
  const res = await api.api.lobbies.leave.$post();
  return res.json();
}

export async function startLobby(): Promise<LobbyPayload> {
  const res = await api.api.lobbies.start.$post();
  return res.json();
}

export async function endLobby(): Promise<LobbyPayload> {
  const res = await api.api.lobbies.end.$post();
  return res.json();
}
