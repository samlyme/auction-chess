import supabase from "../supabase";
import { Ok, Err, HTTPException } from "shared";
import type { Result, APIError } from "shared";
import { z } from "zod";

export async function getAuthHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  return { Authorization: `Bearer ${token || ""}` };
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit,
  schema: z.ZodSchema<T>
): Promise<Result<T, APIError>> {
  try {
    const res = await fetch(url, options);
    const json = await res.json();

    if (!res.ok) {
      const error = HTTPException.parse(json);
      return Err({
        status: res.status,
        message: error.message || "Unknown error",
      });
    }

    const parsed = schema.parse(json);
    return Ok(parsed);
  } catch (error) {
    return Err({
      status: 0,
      message: error instanceof Error ? error.message : "Network error",
    });
  }
}

export const BACKEND_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_BACKEND_URL;
