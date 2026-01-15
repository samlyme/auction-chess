import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Bid, NormalMove } from 'shared';
import { api } from '@/hooks/queries/api';
import { parseResponse } from 'hono/client';

export function useGame() {
  return useQuery({
    queryKey: ['game'],
  // NOTE: the get request is routed to the lobbies route for a reason.
  // It is so that the get request can actually go through the lobby validation,
  // which is less performant than the regular game functionality.
    queryFn: () => parseResponse(api.lobbies.game.$get()),
  });
}

export function useMakeBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bid: Bid) => parseResponse(api.game.play.bid.$post({ json: bid })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game'] });
    },
  });
}

export function useMakeMove() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (move: NormalMove) => parseResponse(api.game.play.move.$post({ json: move })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game'] });
    },
  });
}

export function useTimecheck() {
  return useMutation({
    mutationFn: () => parseResponse(api.game.timecheck.$post()),
  });
}
