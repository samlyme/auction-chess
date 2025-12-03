import { getAuthHeader, apiFetch, BACKEND_URL } from "./utils";
import { Bid, NormalMove } from "shared";
import { Lobby, type  Result } from "shared";

const BASE_URL = `${BACKEND_URL}/api/lobbies/game`;

export async function makeBid(bid: Bid): Promise<Result<Lobby>> {
  const authHeader = await getAuthHeader();

  return apiFetch(
    `${BASE_URL}/bid`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
      body: JSON.stringify(bid),
    },
    Lobby,
  );
}

export async function makeMove(
  move: NormalMove,
): Promise<Result<Lobby>> {
  const authHeader = await getAuthHeader();

  return apiFetch(
    `${BASE_URL}/move`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
      body: JSON.stringify(move),
    },
    Lobby,
  );
}
