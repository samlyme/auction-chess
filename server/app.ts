import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { lobbies } from "./routes/lobbies.ts";
import { profiles } from "./routes/profiles.ts";
import { game } from "./routes/game.ts";
import type { AuthedEnv, SupabaseEnv } from "./types.ts";
import { validateAuth } from "./middleware/auth.ts";
import { HTTPException } from "hono/http-exception";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "shared";
import { requestTimer, measureMiddleware } from "./middleware/performance.ts";

export function createApp(supabase: SupabaseClient<Database>) {
  const app = new Hono<SupabaseEnv>().basePath("/api");

  app.use(logger());
  app.use(requestTimer);

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
    measureMiddleware(
      cors({
        origin: corsHeaders["Access-Control-Allow-Origin"],
        allowHeaders: corsHeaders["Access-Control-Allow-Headers"],
      }),
      "CORS",
    ),
  );

  // Inject supabase client into context
  app.use(
    measureMiddleware(async (c: Context<SupabaseEnv>, next) => {
      c.set("supabase", supabase);
      await next();
    }, "Supabase Injection"),
  );

  app.use(measureMiddleware(validateAuth, "Auth Validation"));

  app.route("/lobbies/game", game);
  app.route("/lobbies", lobbies);
  app.route("/profiles", profiles);

  return app;
}
