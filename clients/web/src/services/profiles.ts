import type { Profile, ProfileCreate, ProfileUpdate } from 'shared';
import { api } from '@/services/api';
import { parseResponse } from 'hono/client';

export async function createProfile(profile: ProfileCreate): Promise<Profile> {
  return await parseResponse(api.profiles.$post({ json: profile }));
}

export async function getProfile(
  query?: { username: string } | { id: string }
): Promise<Profile | null> {
  if (query) {
    return await parseResponse(api.profiles.$get({ query }));
  } else {
    return await parseResponse(api.profiles.me.$get());
  }
}

export async function updateProfile(profile: ProfileUpdate): Promise<Profile> {
  return await parseResponse(api.profiles.$put({ json: profile }));
}
