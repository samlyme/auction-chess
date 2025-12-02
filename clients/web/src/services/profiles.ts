import { Profile, ProfileCreate, ProfileUpdate } from "shared";
import { BACKEND_URL, getAuthHeader } from "./utils";

const BASE_URL = `${BACKEND_URL}/api/profiles`;

export async function createProfile(profile: ProfileCreate) {
  const authHeader = await getAuthHeader();

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify(ProfileCreate.parse(profile)),
  });

  return Profile.parse(await res.json());
}

export async function getProfile(
  query: { username: string } | { id: string } | null = null,
) {
  const authHeader = await getAuthHeader();

  const route = query ? "?" + new URLSearchParams(query).toString() : "/me";

  const res = await fetch(`${BASE_URL}${route}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
  });

  return Profile.nullable().parse(await res.json());
}

export async function updateProfile(profile: ProfileUpdate) {
  const authHeader = await getAuthHeader();

  const res = await fetch(BASE_URL, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify(ProfileUpdate.parse(profile)),
  });

  return Profile.parse(await res.json());
}
