import type { Bid, NormalMove, AuctionChessState, Result } from 'shared';
import { api } from './api';
import { handleApiCall } from './utils';

export async function makeBid(bid: Bid): Promise<Result<null>> {
  return handleApiCall(() => api.api.game.play.bid.$post({ json: bid }));
}

export async function makeMove(move: NormalMove): Promise<Result<null>> {
  return handleApiCall(() => api.api.game.play.move.$post({ json: move }));
}

export async function getGame(): Promise<Result<AuctionChessState | null>> {
  // NOTE: the get request is routed to the lobbies route for a reason.
  // It is so that the get request can actually go through the lobby validation,
  // which is less performant than the regular game functionality.
  return handleApiCall(() => api.api.lobbies.game.$get());
}

export async function timecheck(): Promise<Result<null>> {
  return handleApiCall(() => api.api.game.timecheck.$post());
}
