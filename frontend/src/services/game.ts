import type { LobbyId, Move } from "../schemas/types";

const URL = "/api/lobbies"

export function sendMove(access_token: string, lobbyId: LobbyId, move: Move) {
  return fetch(`${URL}/${lobbyId}/move`, {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(move),
  }).then((res: Response) => res.json());
}