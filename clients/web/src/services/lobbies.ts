import type { Tables } from "shared";
import { getAuthHeader } from "./utils";

export type Lobby = Tables<"lobbies">;

const BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api/lobbies`;


export async function createLobby(): Promise<Lobby> {
  const authHeader = await getAuthHeader();

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
  });

  return await res.json();
}

export async function getLobby(): Promise<Lobby | null> {
  const authHeader = await getAuthHeader();

  const res = await fetch(BASE_URL, {
    headers: {
      ...authHeader,
    },
  });

  return await res.json();
}

export async function deleteLobby(code: string): Promise<Lobby> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${BASE_URL}/${encodeURIComponent(code)}`, {
    method: "DELETE",
    headers: {
      ...authHeader,
    },
  });

  return await res.json();
}

export async function joinLobby(code: string): Promise<Lobby | null> {
  const authHeader = await getAuthHeader();

  const res = await fetch(
    `${BASE_URL}/${encodeURIComponent(code)}/join`,
    {
      method: "POST",
      headers: {
        ...authHeader,
      },
    }
  );

  return await res.json();
}

export async function leaveLobby(code: string): Promise<Lobby | null> {
  const authHeader = await getAuthHeader();

  const res = await fetch(
    `${BASE_URL}/${encodeURIComponent(code)}/leave`,
    {
      method: "POST",
      headers: {
        ...authHeader,
      },
    }
  );

  return await res.json();

}
