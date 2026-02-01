import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { api } from "./api";
import type { LobbyConfig, LobbyPayload } from "shared/types/lobbies";

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

export function useUpdateLobbyConfigMutationOptions() {
  return mutationOptions({
    mutationFn: (lobbyConfig: LobbyConfig) =>
      parseResponse(api.lobbies.$put({ json: lobbyConfig })),
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
      context.client.invalidateQueries({ queryKey: ["game"] });
      // This requires you to invalidate "game" because upon joining,
      // you have no idea what the game state is. You also don't
      // receive a realtime update when you join.
    },
  });
}

export function useLeaveLobbyMutationOptions() {
  return mutationOptions({
    mutationFn: () => parseResponse(api.lobbies.leave.$post()),
    onSuccess: (data, _variables, _onMutateResult, context) => {
      context.client.setQueryData(["lobby"], data);
      context.client.invalidateQueries({ queryKey: ["game"] });
      // Upon leaving, the realtime hook will take care of the game state.
    },
  });
}

export function useStartLobbyMutationOptions() {
  return mutationOptions({
    mutationFn: () => parseResponse(api.lobbies.start.$post()),
    onSuccess: (data, _variables, _onMutateResult, context) => {
      context.client.setQueryData(["lobby"], data);
      context.client.invalidateQueries({ queryKey: ["game"]})
    },
  });
}

export function useEndLobbyMutationOptions() {
  return mutationOptions({
    mutationFn: () => parseResponse(api.lobbies.end.$post()),
    onSuccess: (data, _variables, _onMutateResult, context) => {
      context.client.setQueryData(["lobby"], data);
      context.client.invalidateQueries({ queryKey: ["game"]})
    },
  });
}

export function useDeleteLobbyMutationOptions() {
  return mutationOptions({
    mutationFn: () => parseResponse(api.lobbies.$delete()),
    onSuccess: (_data, _variables, _onMutateResult, context) => {
      context.client.setQueryData(["lobby"], null);
      context.client.invalidateQueries({ queryKey: ["game"]})
    },
  });
}
