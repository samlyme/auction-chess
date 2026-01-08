import type { Bid, LobbyId, Move } from "../schemas/types";

const URL = "/api/lobbies";

export function sendMove(access_token: string, lobbyId: LobbyId, move: Move) {
  console.trace();
  return fetch(`${URL}/${lobbyId}/move?move=${move}`, {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  }).then((res: Response) => res.json());
}

export function sendBid(access_token: string, lobbyId: LobbyId, bid: Bid) {
  console.trace();
  return fetch(`${URL}/${lobbyId}/bid`, {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bid),
  }).then((res: Response) => res.json());
}
