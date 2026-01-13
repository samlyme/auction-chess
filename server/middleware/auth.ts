import { bearerAuth } from "hono/bearer-auth";
import { verifyWithJwks } from "hono/jwt";
import type { User } from "@supabase/supabase-js";
import { endTime, startTime } from "hono/timing";

// Cache JWKS to avoid fetching on every request
let jwksCache: { keys: any[]; fetchedAt: number } | null = null;
const JWKS_CACHE_TTL = 3600 * 1000; // 1 hour in milliseconds

async function getJwks(): Promise<any[]> {
  const now = Date.now();

  // Return cached keys if still valid
  if (jwksCache && now - jwksCache.fetchedAt < JWKS_CACHE_TTL) {
    return jwksCache.keys;
  }

  // Fetch fresh keys
  const response = await fetch(
    `${process.env["SUPABASE_URL"]}/auth/v1/.well-known/jwks.json`,
  );
  const data = (await response.json()) as any;

  jwksCache = {
    keys: data.keys,
    fetchedAt: now,
  };

  return data.keys;
}

export const validateAuth = bearerAuth({
  verifyToken: async (token, c) => {
    try {
      startTime(c, "validateAuth");
      const keys = await getJwks();
      const payload = (await verifyWithJwks(token, {
        keys, // Use cached keys instead of jwks_uri
      })) as any;

      // Map JWT payload to User object structure
      const user: User = {
        id: payload.sub,
        app_metadata: payload.app_metadata || {},
        user_metadata: payload.user_metadata || {},
        aud: payload.aud,
        email: payload.email,
        phone: payload.phone,
        created_at: new Date(payload.iat * 1000).toISOString(),
        role: payload.role,
        is_anonymous: payload.is_anonymous ?? false,
        updated_at: new Date(payload.iat * 1000).toISOString(),
      };

      c.set("user", user);
      return true;
    } catch (error) {
      return false;
    } finally {
      endTime(c, "validateAuth");
    }
  },
});
