import { queryOptions, mutationOptions } from '@tanstack/react-query';
import type { Bid, NormalMove } from 'shared';
import { api } from '@/queries/api';
import { parseResponse } from 'hono/client';

export function useGameOptions() {
  return queryOptions({
    queryKey: ['game'],
  // NOTE: the get request is routed to the lobbies route for a reason.
  // It is so that the get request can actually go through the lobby validation,
  // which is less performant than the regular game functionality.
    queryFn: () => parseResponse(api.lobbies.game.$get()),
  });
}

// TODO: Optimistic updates here!
export function useMakeBidMutationOptions() {
  return mutationOptions({
    mutationFn: (bid: Bid) => parseResponse(api.game.play.bid.$post({ json: bid })),
    onSuccess: (_data, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ['game'] });
    },
  })
}

export function useMakeMoveMutationOptions() {
  return mutationOptions({
    mutationFn: (move: NormalMove) => parseResponse(api.game.play.move.$post({ json: move })),
    onSuccess: (_data, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ['game'] });
    },
  }
  )
}

// NOTE: do not make this optimistic!
export function useTimecheckMutationOptions() {
  return mutationOptions({
    mutationFn: () => parseResponse(api.game.timecheck.$post()),
  })
}
