import { Hono } from "hono";
import { cors } from "hono/cors";
import { lobbies } from "./routes/lobbies.ts";
import type { AuthedEnv, SupabaseEnv } from "./types.ts";
import { profiles } from "./routes/profiles.ts";
import { validateAuth } from "./middleware/auth.ts";
import { HTTPException } from "hono/http-exception";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "shared";

export function createApp(supabase: SupabaseClient<Database>) {
  const app = new Hono<SupabaseEnv>().basePath("/api");

  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ message: err.message }, err.status);
    }

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
    }),
  );

  // Inject supabase client into context
  app.use(async (c, next) => {
    c.set("supabase", supabase);
    await next();
  });

  app.use(validateAuth);

  app.route("/lobbies", lobbies);
  app.route("/profiles", profiles);

  return app;
}
