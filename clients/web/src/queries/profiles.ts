import { queryOptions, mutationOptions } from "@tanstack/react-query";
import type { ProfileCreate, ProfileUpdate } from "shared/types";
import { parseResponse } from "hono/client";
import { api } from "./api";

// TODO: Cache profiles!
export function useProfileOptions(
  query?: { username: string } | { id: string }
) {
  return queryOptions({
    queryKey: ["profile", query],
    queryFn: () => {
      if (query) {
        return parseResponse(api.profiles.$get({ query }));
      } else {
        return parseResponse(api.profiles.me.$get());
      }
    },
  });
}

export function useMyProfileOptions() {
  return queryOptions({
    queryKey: ["profile", "me"],
    queryFn: () => parseResponse(api.profiles.me.$get()),
  });
}

export function useCreateProfileMutationOptions() {
  return mutationOptions({
    mutationFn: (profile: ProfileCreate) =>
      parseResponse(api.profiles.$post({ json: profile })),
    onSuccess: (data, _variables, _onMutateResult, context) => {
      console.log("muation successful", { data });

      context.client.setQueryData(["profile", "me"], data);
    },
  });
}

export function useUpdateProfileMutationOptions() {
  return mutationOptions({
    mutationFn: (profile: ProfileUpdate) =>
      parseResponse(api.profiles.$put({ json: profile })),
    onSuccess: (data, _variables, _onMutateResult, context) => {
      context.client.setQueryData(["profile", "me"], data);
    },
  });
}
