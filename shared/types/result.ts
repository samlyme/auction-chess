export type Result<T, E = any> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Helper functions for creating Results
export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });
