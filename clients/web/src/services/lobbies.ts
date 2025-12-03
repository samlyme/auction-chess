import { getAuthHeader, apiFetch, BACKEND_URL } from "./utils";
import { LobbyPayload } from "shared";
import type { Result } from "shared";
import { z } from "zod";

const BASE_URL = `${BACKEND_URL}/api/lobbies`;

export async function createLobby(): Promise<Result<LobbyPayload>> {
  const authHeader = await getAuthHeader();

  return apiFetch(
    BASE_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
    },
    LobbyPayload,
  );
}

export async function getLobby(): Promise<Result<LobbyPayload | null>> {
  const authHeader = await getAuthHeader();

  return apiFetch(
    BASE_URL,
    {
      headers: {
        ...authHeader,
      },
    },
    LobbyPayload.nullable(),
  );
}

export async function deleteLobby(): Promise<Result<any>> {
  const authHeader = await getAuthHeader();

  return apiFetch(
    BASE_URL,
    {
      method: "DELETE",
      headers: {
        ...authHeader,
      },
    },
    z.object(),
  );
}

export async function joinLobby(code: string): Promise<Result<LobbyPayload>> {
  const authHeader = await getAuthHeader();

  return apiFetch(
    `${BASE_URL}/join?code=${code}`,
    {
      method: "POST",
      headers: {
        ...authHeader,
      },
    },
    LobbyPayload,
  );
}

export async function leaveLobby(): Promise<Result<LobbyPayload | null>> {
  const authHeader = await getAuthHeader();

  return apiFetch(
    `${BASE_URL}/leave`,
    {
      method: "POST",
      headers: {
        ...authHeader,
      },
    },
    LobbyPayload.nullable(),
  );
}

export async function startLobby(): Promise<Result<LobbyPayload>> {
  const authHeader = await getAuthHeader();

  return apiFetch(
    `${BASE_URL}/start`,
    {
      method: "POST",
      headers: {
        ...authHeader,
      },
    },
    LobbyPayload,
  );
}
