import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { api } from "@/queries/api";
import { parseResponse } from "hono/client";
import { AuctionChessStateSchema, type AuctionChessState, type Bid, type NormalMove, type GameContext, type GameTransient } from "shared/types/game";
import { updateGame } from "shared/game/update";
import { produce } from "immer";

export function useGameOptions() {
  return queryOptions({
    queryKey: ["game"],
    // NOTE: the get request is routed to the lobbies route for a reason.
    // It is so that the get request can actually go through the lobby validation,
    // which is less performant than the regular game functionality.
    queryFn: async (): Promise<GameContext | null> => {
      const res = await parseResponse(api.lobbies.game.$get());
      const chessState = AuctionChessStateSchema.nullable().parse(res);
      // Wrap the game state in a GameContext with empty log (GET doesn't provide logs)
      return chessState ? { game: chessState, log: [] } : null;
    },
  });
}

export function useMakeBidMutationOptions() {
  return mutationOptions({
    mutationFn: (bid: Bid) =>
      parseResponse(api.game.play.bid.$post({ json: bid })),
    onMutate: async (bid, context) => {
      // Cancel outgoing refetches to prevent race conditions
      await context.client.cancelQueries({ queryKey: ["game"] });

      // Snapshot the previous value for rollback
      const previousGameContext = context.client.getQueryData<GameContext>(["game"]);

      // Optimistically update the cache
      if (previousGameContext) {
        try {
          // Apply the bid update (mutates optimisticGame in place)
          // NOTE: We don't apply time deductions here - the server will handle that
          const optimistic = produce(previousGameContext, (draft) => {
            updateGame(draft, { type: "bid", data: bid });
          })

          // Update cache with optimistic state
          context.client.setQueryData(["game"], optimistic);
        } catch (error) {
          // If optimistic update fails (e.g., invalid bid), don't update cache
          // The server will reject it and onError will handle rollback
          console.warn("Optimistic bid update failed:", error);
        }
      }

      // Return context for rollback in onError
      return { previousGameContext };
    },
    onError: (_error, _bid, onMutateResult, context) => {
      // Rollback to previous state on error
      if (onMutateResult?.previousGameContext) {
        context.client.setQueryData(["game"], onMutateResult.previousGameContext);
      }
    },
    onSuccess: (data, _variables, _onMutateResult, context) => {
      // Server response is source of truth, replace optimistic state
      const game = AuctionChessStateSchema.parse(data);
      // Server mutations don't provide logs, wrap with empty log array
      context.client.setQueryData(["game"], { game, log: [] });
    },
  });
}

export function useMakeMoveMutationOptions() {
  return mutationOptions({
    mutationFn: (move: NormalMove) =>
      parseResponse(api.game.play.move.$post({ json: move })),
    onMutate: async (move, context) => {
      // Cancel outgoing refetches to prevent race conditions
      await context.client.cancelQueries({ queryKey: ["game"] });

      // Snapshot the previous value for rollback
      const previousGameContext = context.client.getQueryData<GameContext>(["game"]);

      // Optimistically update the cache
      if (previousGameContext) {
        try {

          const optimistic = produce(previousGameContext, (draft) => {
            updateGame(draft, { type: "move", data: move });
          })
          // Apply the move update (mutates optimisticGame in place)
          // NOTE: We don't apply time deductions here - the server will handle that

          // Update cache with optimistic state
          context.client.setQueryData(["game"], optimistic);
        } catch (error) {
          // If optimistic update fails (e.g., invalid move), don't update cache
          // The server will reject it and onError will handle rollback
          console.warn("Optimistic move update failed:", error);
        }
      }

      // Return context for rollback in onError
      return { previousGameContext };
    },
    onError: (_error, _move, onMutateResult, context) => {
      // Rollback to previous state on error
      if (onMutateResult?.previousGameContext) {
        context.client.setQueryData(["game"], onMutateResult.previousGameContext);
      }
    },
    onSuccess: (data, _variables, _onMutateResult, context) => {
      // Server response is source of truth, replace optimistic state
      const game = AuctionChessStateSchema.parse(data);
      // Server mutations don't provide logs, wrap with empty log array
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
