import type { LobbyProfile } from "../schemas/types";

const URL = "/api/lobbies";

export function createLobby(access_token: string): Promise<LobbyProfile> {
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
