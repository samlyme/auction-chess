import type { Bid, NormalMove, AuctionChessState } from 'shared';
import { api } from './api';
import { parseResponse } from 'hono/client';

export async function makeBid(bid: Bid): Promise<undefined> {
  return await parseResponse(api.game.play.bid.$post({ json: bid }));
}

export async function makeMove(move: NormalMove): Promise<undefined> {
  return await parseResponse(api.game.play.move.$post({ json: move }));
}

export async function getGame(): Promise<AuctionChessState | null> {
  // NOTE: the get request is routed to the lobbies route for a reason.
  // It is so that the get request can actually go through the lobby validation,
  // which is less performant than the regular game functionality.
  return await parseResponse(api.lobbies.game.$get());
}

export async function timecheck(): Promise<undefined> {
  return await parseResponse(api.game.timecheck.$post());
}
