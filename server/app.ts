import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { lobbies } from "./routes/lobbies.ts";
import { profiles } from "./routes/profiles.ts";
import { game } from "./routes/game.ts";
import type { BaseEnv } from "./types/honoEnvs.ts";
import { validateAuth } from "./middleware/auth.ts";
import { HTTPException } from "hono/http-exception";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types/database.types.ts";
import { timing } from "hono/timing";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": [
    "authorization",
    "x-client-info",
    "apikey",
    "content-type",
  ],
};

export function createApp(supabase: SupabaseClient<Database>) {
  const app = new Hono<BaseEnv>()
    .basePath("/api")
    .use(timing())
    .use(logger())
    .onError((err, c) => {
      if (err instanceof HTTPException) {
        return c.json({ message: err.message }, err.status);
      }
      console.error(err);

      return c.json({ message: "Internal Server Error" }, 500);
    })
    .use(
      cors({
        origin: corsHeaders["Access-Control-Allow-Origin"],
        allowHeaders: corsHeaders["Access-Control-Allow-Headers"],
        maxAge: 86400, // Cache preflight for 24 hours
      }),
    )
    .use(async (c: Context<BaseEnv>, next) => {
      c.set("supabase", supabase);
      await next();
    })
    .use(validateAuth)
    // NOTE: the get request is routed to the lobbies route for a reason.
    // It is so that the get request can actually go through the lobby validation,
    // which is less performant than the regular game functionality.
    .route("/lobbies", lobbies)
    .route("/game", game)
    .route("/profiles", profiles);

  return app;
}

export type AppType = ReturnType<typeof createApp>;
