import { getAuthHeader, apiFetch, BACKEND_URL } from "./utils";
import { Bid, NormalMove, AuctionChessState } from "shared";
import { type  Result } from "shared";
import { z } from "zod";

const BASE_URL = `${BACKEND_URL}/api/lobbies/game`;

export async function makeBid(bid: Bid): Promise<Result<null>> {
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
    z.null(),
  );
}

export async function makeMove(
  move: NormalMove,
): Promise<Result<null>> {
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
    z.null(),
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
