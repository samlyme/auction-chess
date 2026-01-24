import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { api } from "@/queries/api";
import { parseResponse } from "hono/client";
import { AuctionChessStateSchema, type AuctionChessState, type Bid, type NormalMove } from "shared/types/game";

export function useGameOptions() {
  return queryOptions({
    queryKey: ["game"],
    // NOTE: the get request is routed to the lobbies route for a reason.
    // It is so that the get request can actually go through the lobby validation,
    // which is less performant than the regular game functionality.
    queryFn: async () => {
      const res = await parseResponse(api.lobbies.game.$get());
      console.log("get game!", res);
      const chessState = AuctionChessStateSchema.nullable().parse(res);
      console.log("parse game!", chessState);
      return chessState;
    },
  });
}

export function usePrevGameOptions() {
  return queryOptions({
    queryKey: ["game", "prev"],
    // This is a "fake" query! Only exists on client.
    queryFn: (): null | AuctionChessState => null,
    staleTime: Infinity,
  })
}

// TODO: Optimistic updates here!
export function useMakeBidMutationOptions() {
  return mutationOptions({
    mutationFn: (bid: Bid) =>
      parseResponse(api.game.play.bid.$post({ json: bid })),
    onSuccess: (data, _variables, _onMutateResult, context) => {
      context.client.setQueryData(["game"], AuctionChessStateSchema.parse(data));
    },
  });
}

export function useMakeMoveMutationOptions() {
  return mutationOptions({
    mutationFn: (move: NormalMove) =>
      parseResponse(api.game.play.move.$post({ json: move })),
    onSuccess: (data, _variables, _onMutateResult, context) => {
      context.client.setQueryData(["game"], AuctionChessStateSchema.parse(data));
    },
  });
}

// NOTE: do not make this optimistic!
export function useTimecheckMutationOptions() {
  return mutationOptions({
    mutationFn: () => parseResponse(api.game.timecheck.$post()),
  });
}
