import type { LobbyId, LobbyProfile } from "../schemas/types";

const URL = "/api/lobbies";

export function userLobby(access_token: string): Promise<LobbyProfile | null> {
  return fetch(`${URL}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  })
  .then((res: Response) => res.json())
}

export function getLobby(access_token: string, lobbyId: LobbyId): Promise<LobbyProfile> {
  return fetch(`${URL}/${lobbyId}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  })
  .then((res: Response) => {
    if (!res.ok) throw Error("Not found")
    return res
  })
  .then((res: Response) => res.json())
}

// TODO: Add error handling
export function createLobby(access_token: string): Promise<LobbyProfile | null> {
  console.log("Creating lobby with token:", access_token);

  return fetch(`${URL}`, {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "",
  }).then((res: Response) => res.json());
}

export function startLobby(
  access_token: string,
  lobbyId: string
): Promise<void> {
  return fetch(`${URL}/${lobbyId}/start`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${access_token}`,
      accept: "application/json",
    },
  }).then((res: Response) => {
    if (res.ok) return;
    throw new Error(`Failed to start, ${res}`)
  });
}

export function deleteLobby(
  access_token: string,
  lobbyId: string
): Promise<void> {
  return fetch(`${URL}/${lobbyId}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${access_token}`,
    },
  })
  .then((res: Response) => {
    if (res.ok) return;
    throw new Error(`Failed to delete, ${res}`)
  })
}

export function joinLobby(
  access_token: string,
  lobbyId: string
): Promise<LobbyProfile> {
  return fetch(`${URL}/${lobbyId}/join`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${access_token}`,
      accept: "application/json",
    },
  }).then((res: Response) => res.json());
}

export function leaveLobby(
  access_token: string,
  lobbyId: string
): Promise<void> {
  return fetch(`${URL}/${lobbyId}/leave`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${access_token}`,
    },
  })
  .then((res: Response) => {
    if (res.ok) return;
    throw new Error(`Failed to delete, ${res}`)
  })
}