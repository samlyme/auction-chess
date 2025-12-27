import type { Profile, ProfileCreate, ProfileUpdate } from "shared";
import { api } from "./api";

export async function createProfile(profile: ProfileCreate): Promise<Profile> {
  const res = await api.api.profiles.$post({ json: profile });
  return res.json();
}

export async function getProfile(
  query: { username: string } | { id: string } | null = null,
): Promise<Profile | null> {
  if (query) {
    const res = await api.api.profiles.$get({ query });
    return res.json();
  } else {
    const res = await api.api.profiles.me.$get();
    return res.json();
  }
}

export async function updateProfile(profile: ProfileUpdate): Promise<Profile> {
  const res = await api.api.profiles.$put({ json: profile });
  return res.json();
}
