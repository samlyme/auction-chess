import { queryOptions, mutationOptions } from "@tanstack/react-query";
import type { LobbyConfig, LobbyPayload } from "shared/types";
import { parseResponse } from "hono/client";
import { api } from "./api";

export function useLobbyOptions(initLobby?: LobbyPayload) {
  return queryOptions({
    queryKey: ["lobby"],
    queryFn: () => parseResponse(api.lobbies.$get()),
    initialData: initLobby,
  });
}

export function useCreateLobbyMutationOptions() {
  return mutationOptions({
    mutationFn: (lobbyConfig: LobbyConfig) =>
      parseResponse(api.lobbies.$post({ json: lobbyConfig })),
    onSuccess: (data, _variables, _onMutateResult, context) => {
      context.client.setQueryData(["lobby"], data);
    },
  });
}

export function useJoinLobbyMutationOptions() {
  return mutationOptions({
    mutationFn: (code: string) =>
      parseResponse(api.lobbies.join.$post({ query: { code } })),
    onSuccess: (data, _variables, _onMutateResult, context) => {
      context.client.setQueryData(["lobby"], data);
    },
  });
}

export function useLeaveLobbyMutationOptions() {
  return mutationOptions({
    mutationFn: () => parseResponse(api.lobbies.leave.$post()),
    onSuccess: (data, _variables, _onMutateResult, context) => {
      context.client.setQueryData(["lobby"], data);
    },
  });
}

export function useStartLobbyMutationOptions() {
  return mutationOptions({
    mutationFn: () => parseResponse(api.lobbies.start.$post()),
    onSuccess: (data, _variables, _onMutateResult, context) => {
      context.client.setQueryData(["lobby"], data);
    },
  });
}

export function useEndLobbyMutationOptions() {
  return mutationOptions({
    mutationFn: () => parseResponse(api.lobbies.end.$post()),
    onSuccess: (data, _variables, _onMutateResult, context) => {
      context.client.setQueryData(["lobby"], data);
    },
  });
}

export function useDeleteLobbyMutationOptions() {
  return mutationOptions({
    mutationFn: () => parseResponse(api.lobbies.$delete()),
    onSuccess: (_data, _variables, _onMutateResult, context) => {
      context.client.setQueryData(["lobby"], null);
    },
  });
}
