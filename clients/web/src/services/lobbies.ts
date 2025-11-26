import { getAuthHeader } from "./utils";
import { HTTPException, Lobby } from "shared";
import { z } from "zod";

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/lobbies`;

export async function createLobby(): Promise<Lobby> {
  const authHeader = await getAuthHeader();

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
  });

  return Lobby.parse(await res.json());
}

export async function getLobby(): Promise<Lobby | null> {
  const authHeader = await getAuthHeader();

  const res = await fetch(BASE_URL, {
    headers: {
      ...authHeader,
    },
  });

  return Lobby.nullable().parse(await res.json());
}

export async function deleteLobby(): Promise<Lobby> {
  const authHeader = await getAuthHeader();

  const res = await fetch(BASE_URL, {
    method: "DELETE",
    headers: {
      ...authHeader,
    },
  });

  return Lobby.parse(await res.json());
}

export async function joinLobby(code: string) {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${BASE_URL}/join?code=${code}`, {
    method: "POST",
    headers: {
      ...authHeader,
    },
  });

  const json = await res.json();

  return z.preprocess(
    (data) => {
      if (data && typeof data === "object" && "message" in data) {
        // error shape
        return { ...(data as any), type: "error" as const };
      }
      // otherwise assume lobby
      return { ...(data as any), type: "lobby" as const };
    },
    z.discriminatedUnion("type", [
      Lobby.extend({ type: z.literal("lobby") }),
      HTTPException.extend({ type: z.literal("error") }),
    ]),
  ).parse(json);
}

export async function leaveLobby(): Promise<Lobby | null> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${BASE_URL}/leave`, {
    method: "POST",
    headers: {
      ...authHeader,
    },
  });

  return Lobby.nullable().parse(await res.json());
}
