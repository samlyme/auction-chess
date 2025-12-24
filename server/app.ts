import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { lobbies } from "./routes/lobbies.ts";
import { profiles } from "./routes/profiles.ts";
import { game } from "./routes/game.ts";
import type { AuthedEnv, BaseEnv } from "./types.ts";
import { validateAuth } from "./middleware/auth.ts";
import { HTTPException } from "hono/http-exception";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "shared";
import { timing } from "hono/timing";

export function createApp(supabase: SupabaseClient<Database>) {
  const app = new Hono<BaseEnv>().basePath("/api");

  app.use(timing());

  app.use(logger());

  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ message: err.message }, err.status);
    }
    console.error(err);


    return c.json({ message: "Internal Server Error" }, 500);
  });

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": [
      "authorization",
      "x-client-info",
      "apikey",
      "content-type",
    ],
  };
  app.use(
      cors({
        origin: corsHeaders["Access-Control-Allow-Origin"],
        allowHeaders: corsHeaders["Access-Control-Allow-Headers"],
        maxAge: 86400, // Cache preflight for 24 hours
      }),
  );

  // Inject supabase client into context
  app.use(
    async (c: Context<BaseEnv>, next) => {
      c.set("supabase", supabase);
      await next();
    }
  );

  app.use(validateAuth);

  app.route("/lobbies/game", game);
  app.route("/lobbies", lobbies);
  app.route("/profiles", profiles);

  return app;
}
