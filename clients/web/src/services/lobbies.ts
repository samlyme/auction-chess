import { getAuthHeader, apiFetch, BACKEND_URL } from "./utils";
import { Lobby } from "shared";
import type { Result } from "shared";
import { z } from "zod";

const BASE_URL = `${BACKEND_URL}/api/lobbies`;

export async function createLobby(): Promise<Result<Lobby>> {
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
    Lobby,
  );
}

export async function getLobby(): Promise<Result<Lobby | null>> {
  const authHeader = await getAuthHeader();

  return apiFetch(
    BASE_URL,
    {
      headers: {
        ...authHeader,
      },
    },
    Lobby.nullable(),
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

export async function joinLobby(code: string): Promise<Result<Lobby>> {
  const authHeader = await getAuthHeader();

  return apiFetch(
    `${BASE_URL}/join?code=${code}`,
    {
      method: "POST",
      headers: {
        ...authHeader,
      },
    },
    Lobby,
  );
}

export async function leaveLobby(): Promise<Result<Lobby | null>> {
  const authHeader = await getAuthHeader();

  return apiFetch(
    `${BASE_URL}/leave`,
    {
      method: "POST",
      headers: {
        ...authHeader,
      },
    },
    Lobby.nullable(),
  );
}

export async function startLobby(): Promise<Result<Lobby>> {
  const authHeader = await getAuthHeader();

  return apiFetch(
    `${BASE_URL}/start`,
    {
      method: "POST",
      headers: {
        ...authHeader,
      },
    },
    Lobby,
  );
}

export async function endLobby(): Promise<Result<Lobby>> {
  const authHeader = await getAuthHeader();

  return apiFetch(
    `${BASE_URL}/end`,
    {
      method: "POST",
      headers: {
        ...authHeader,
      },
    },
    Lobby,
  );
}
