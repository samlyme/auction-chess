import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createLobby,
  deleteLobby,
  getLobby,
  joinLobby,
  leaveLobby,
  startLobby,
  endLobby,
} from '@/services/lobbies';
import type { LobbyConfig } from 'shared';

export function useLobby() {
  return useQuery({
    queryKey: ['lobby'],
    queryFn: getLobby,
  });
}

export function useCreateLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lobbyConfig: LobbyConfig) => createLobby(lobbyConfig),
    onSuccess: (data) => {
      queryClient.setQueryData(['lobby'], data);
    },
  });
}

export function useJoinLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => joinLobby(code),
    onSuccess: (data) => {
      queryClient.setQueryData(['lobby'], data);
    },
  });
}

export function useLeaveLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => leaveLobby(),
    onSuccess: (data) => {
      queryClient.setQueryData(['lobby'], data);
    },
  });
}

export function useStartLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startLobby(),
    onSuccess: (data) => {
      queryClient.setQueryData(['lobby'], data);
    },
  });
}

export function useEndLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => endLobby(),
    onSuccess: (data) => {
      queryClient.setQueryData(['lobby'], data);
    },
  });
}

export function useDeleteLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteLobby(),
    onSuccess: () => {
      queryClient.setQueryData(['lobby'], null);
    },
  });
}
