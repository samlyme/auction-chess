import type { Profile, ProfileCreate, ProfileUpdate, Result } from "shared";
import { api } from "./api";
import { handleApiCall } from "./utils";

export async function createProfile(
  profile: ProfileCreate,
): Promise<Result<Profile>> {
  return handleApiCall(() => api.api.profiles.$post({ json: profile }));
}

export async function getProfile(
  query: { username: string } | { id: string } | null = null,
): Promise<Result<Profile | null>> {
  if (query) {
    return handleApiCall(() => api.api.profiles.$get({ query }));
  } else {
    return handleApiCall(() => api.api.profiles.me.$get());
  }
}

export async function updateProfile(
  profile: ProfileUpdate,
): Promise<Result<Profile>> {
  return handleApiCall(() => api.api.profiles.$put({ json: profile }));
}
