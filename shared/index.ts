import { z } from "zod";

export const Profile = z.object({
  bio: z.string(),
  created_at: z.string(),
  id: z.string(),
  username: z.string(),
});
export type Profile = z.infer<typeof Profile>;

export const ProfileCreate = z
  .object({
    id: z.string(),
    username: z.string(),
    bio: z.string(),
  })
  .strict();
export type ProfileCreate = z.infer<typeof ProfileCreate>;

export const ProfileUpdate = z
  .object({
    bio: z.string(),
  })
  .strict();
export type ProfileUpdate = z.infer<typeof ProfileUpdate>;

export const Lobby = z.object({
  code: z.string(),
  config: z.object(), // TODO: define lobby config
  created_at: z.string(),
  game_state: z.object().nullable(),
  guest_uid: z.string().nullable(),
  host_uid: z.string(),
  id: z.number(),
});
export type Lobby = z.infer<typeof Lobby>;

export const LobbyJoinQuery = z.object({
  code: z.string()
})
export type LobbyJoin = z.infer<typeof LobbyJoinQuery>;

export const HTTPException = z.object({
  message: z.string().optional(),
})
export type HTTPException = z.infer<typeof HTTPException>;

// Result type for API responses
export type Result<T, E = APIError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// API Error type
export const APIError = z.object({
  status: z.number(),
  message: z.string(),
});
export type APIError = z.infer<typeof APIError>;

// Helper functions for creating Results
export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// Helper to match on Result types
export function match<T, E, R>(
  result: Result<T, E>,
  handlers: {
    ok: (value: T) => R;
    err: (error: E) => R;
  }
): R {
  return result.ok ? handlers.ok(result.value) : handlers.err(result.error);
}

export * from "./database.types.ts";
