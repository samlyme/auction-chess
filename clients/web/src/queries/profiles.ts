import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { api } from "./api";
import type { ProfileCreate, ProfileUpdate } from "shared/types/profiles";

// For getting other people's profiles.
export function useProfileOptions(
  query: { username: string } | { id: string }
) {
  return queryOptions({
    queryKey: ["profile", query],
    queryFn: () => {
      return parseResponse(api.profiles.$get({ query }));
    },
    staleTime: 5 * 60 * 1000, // Arbitrary. This is for the profiles of others.
  });
}

export function useMyProfileOptions() {
  return queryOptions({
    queryKey: ["profile", "me"],
    queryFn: () => parseResponse(api.profiles.me.$get()),
    staleTime: Infinity, // Doesn't change until we make a mutation.
  });
}

export function useCreateProfileMutationOptions() {
  return mutationOptions({
    mutationKey: ["profile", "me"],
    mutationFn: (variables: ProfileCreate) => {
      const req =  api.profiles.$post({ json: variables });
      return parseResponse(req)
    },
    onSuccess: (data, _variables, _onMutateResult, context) => {
      context.client.setQueryData(["profile", "me"], data);
    },
  });
}

export function useUpdateProfileMutationOptions() {
  return mutationOptions({
    mutationKey: ["profile", "me"],
    mutationFn: (profile: ProfileUpdate) =>
      parseResponse(api.profiles.$put({ json: profile })),
    onSuccess: (data, _variables, _onMutateResult, context) => {
      context.client.setQueryData(["profile", "me"], data);
    },
  });
}

export function useCreateGuestProfileMutationOptions() {
  return mutationOptions({
    mutationKey: ["profile", "me"],
    mutationFn: () => parseResponse(api.profiles.guest.$post()),
    onSuccess: (data, _variables, _onMutateResult, context) => {
      context.client.setQueryData(["profile", "me"], data);
    },
  })
}
