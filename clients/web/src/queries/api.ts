import { DetailedError, hc } from "hono/client";
import type { AppType } from "server/app";
import supabase from "@/supabase";

// This lets the query client know that all errors are DetailedErrors because
// they come from `parseResponse` object.
// For now, make sure that parseResponse is used, or this assumption is wrong.
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: DetailedError;
  }
}

export async function getAuthHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  return { Authorization: `Bearer ${token || ""}` };
}

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const api = hc<AppType>(BACKEND_URL || "", {
  headers: async () => await getAuthHeader(),
}).api;
