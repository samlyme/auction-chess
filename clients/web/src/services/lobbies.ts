import type { Tables } from "../../../../supabase/functions/_shared/database.types"; // adjust path as needed
import supabase from "../supabase";

export type Lobby = Tables<"lobbies">;

const LOBBIES_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api/lobbies`;

async function getAuthHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  return { Authorization: `Bearer ${token || ""}` };
}

export async function createLobby(): Promise<Lobby> {
  const authHeader = await getAuthHeader();

  const res = await fetch(LOBBIES_BASE_URL, {
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

  const res = await fetch(LOBBIES_BASE_URL, {
    headers: {
      ...authHeader,
    },
  });

  return await res.json();
}

export async function deleteLobby(code: string): Promise<Lobby> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${LOBBIES_BASE_URL}/${encodeURIComponent(code)}`, {
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
    `${LOBBIES_BASE_URL}/${encodeURIComponent(code)}/join`,
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
    `${LOBBIES_BASE_URL}/${encodeURIComponent(code)}/leave`,
    {
      method: "POST",
      headers: {
        ...authHeader,
      },
    }
  );

  return await res.json();

}
