import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { api } from "@/queries/api";
import { parseResponse } from "hono/client";
import { AuctionChessStateSchema, type AuctionChessState, type Bid, type NormalMove, type GameContext } from "shared/types/game";

export function useGameOptions() {
  return queryOptions({
    queryKey: ["game"],
    // NOTE: the get request is routed to the lobbies route for a reason.
    // It is so that the get request can actually go through the lobby validation,
    // which is less performant than the regular game functionality.
    queryFn: async (): Promise<GameContext | null> => {
      const res = await parseResponse(api.lobbies.game.$get());
      console.log("get game!", res);
      const chessState = AuctionChessStateSchema.nullable().parse(res);
      console.log("parse game!", chessState);
      // Wrap the game state in a GameContext with empty log (GET doesn't provide logs)
      return chessState ? { game: chessState, log: [] } : null;
    },
  });
}

// TODO: Optimistic updates here!
export function useMakeBidMutationOptions() {
  return mutationOptions({
    mutationFn: (bid: Bid) =>
      parseResponse(api.game.play.bid.$post({ json: bid })),
    onSuccess: (data, _variables, _onMutateResult, context) => {
      const game = AuctionChessStateSchema.parse(data);
      // Mutations don't provide logs, wrap with empty log array
      context.client.setQueryData(["game"], { game, log: [] });
    },
  });
}

export function useMakeMoveMutationOptions() {
  return mutationOptions({
    mutationFn: (move: NormalMove) =>
      parseResponse(api.game.play.move.$post({ json: move })),
    onSuccess: (data, _variables, _onMutateResult, context) => {
      const game = AuctionChessStateSchema.parse(data);
      // Mutations don't provide logs, wrap with empty log array
      context.client.setQueryData(["game"], { game, log: [] });
    },
  });
}

// NOTE: do not make this optimistic!
export function useTimecheckMutationOptions() {
  return mutationOptions({
    mutationFn: () => parseResponse(api.game.timecheck.$post()),
  });
}
