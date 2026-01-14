import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { makeBid, makeMove, getGame, timecheck } from '@/services/game';
import type { Bid, NormalMove } from 'shared';

export function useGame() {
  return useQuery({
    queryKey: ['game'],
    queryFn: getGame,
  });
}

export function useMakeBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bid: Bid) => makeBid(bid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game'] });
    },
  });
}

export function useMakeMove() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (move: NormalMove) => makeMove(move),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game'] });
    },
  });
}

export function useTimecheck() {
  return useMutation({
    mutationFn: () => timecheck(),
  });
}
