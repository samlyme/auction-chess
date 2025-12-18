import { getAuthHeader, apiFetch, BACKEND_URL } from "./utils";
import { Bid, NormalMove, AuctionChessState } from "shared";
import { LobbyPayload, type  Result } from "shared";

const BASE_URL = `${BACKEND_URL}/api/lobbies/game`;

export async function makeBid(bid: Bid): Promise<Result<LobbyPayload>> {
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
    LobbyPayload,
  );
}

export async function makeMove(
  move: NormalMove,
): Promise<Result<LobbyPayload>> {
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
    LobbyPayload,
  );
}

export async function getGame(): Promise<Result<AuctionChessState | null>> {
  const authHeader = await getAuthHeader();

  return apiFetch(
    BASE_URL,
    {
      headers: {
        ...authHeader,
      },
    },
    AuctionChessState.nullable(),
  );
}
