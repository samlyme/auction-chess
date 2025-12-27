import type { Bid, NormalMove, AuctionChessState } from "shared";
import { api } from "./api";

export async function makeBid(bid: Bid): Promise<null> {
  await api.api.game.play.bid.$post({ json: bid });
  // TODO: make this safe, but idc, i'm rewriting this anyway

  return null
}

export async function makeMove(move: NormalMove): Promise<null> {
  await api.api.game.play.move.$post({ json: move });
  return null;
}

export async function getGame(): Promise<AuctionChessState | null> {
  // NOTE: the get request is routed to the lobbies route for a reason.
  // It is so that the get request can actually go through the lobby validation,
  // which is less performant than the regular game functionality.
  const res = await api.api.lobbies.game.$get();
  return res.json();
}

export async function timecheck(): Promise<null> {
  await api.api.game.timecheck.$post();
  return null;
}
