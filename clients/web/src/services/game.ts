import type { Bid, NormalMove, AuctionChessState } from "shared";
import { api } from "./api";

export async function makeBid(bid: Bid): Promise<null> {
  await api.api.lobbies.game.bid.$post({ json: bid });
  // TODO: make this safe, but idc, i'm rewriting this anyway

  return null
}

export async function makeMove(move: NormalMove): Promise<null> {
  await api.api.lobbies.game.move.$post({ json: move });
  return null;
}

export async function getGame(): Promise<AuctionChessState | null> {
  const res = await api.api.lobbies.game.$get();
  return res.json();
}

export async function timecheck(): Promise<null> {
  await api.api.lobbies.game.timecheck.$post();
  return null;
}
