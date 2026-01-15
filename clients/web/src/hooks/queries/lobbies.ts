import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LobbyConfig } from 'shared';
import { parseResponse } from 'hono/client';
import { api } from './api';

export function useLobby() {
  return useQuery({
    queryKey: ['lobby'],
    queryFn: () => parseResponse(api.lobbies.$get())
  });
}

export function useCreateLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lobbyConfig: LobbyConfig) => parseResponse(api.lobbies.$post({ json: lobbyConfig })),
    onSuccess: (data) => {
      queryClient.setQueryData(['lobby'], data);
    },
  });
}

export function useJoinLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => parseResponse(api.lobbies.join.$post({ query: { code }})),
    onSuccess: (data) => {
      queryClient.setQueryData(['lobby'], data);
    },
  });
}

export function useLeaveLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => parseResponse(api.lobbies.leave.$post()),
    onSuccess: (data) => {
      queryClient.setQueryData(['lobby'], data);
    },
  });
}

export function useStartLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => parseResponse(api.lobbies.start.$post()),
    onSuccess: (data) => {
      queryClient.setQueryData(['lobby'], data);
    },
  });
}

export function useEndLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => parseResponse(api.lobbies.end.$post()),
    onSuccess: (data) => {
      queryClient.setQueryData(['lobby'], data);
    },
  });
}

export function useDeleteLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => parseResponse(api.lobbies.$delete()),
    onSuccess: () => {
      queryClient.setQueryData(['lobby'], null);
    },
  });
}
