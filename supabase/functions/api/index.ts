import "@supabase/functions-js";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { corsHeaders } from "../_shared/cors.ts";
import { lobbies } from "./routes/lobbies.ts";
import { AuthedEnv } from "./types.ts";
import { profiles } from "./routes/profiles.ts";
import { validateAuth } from "./middleware/auth.ts";

const app = new Hono<AuthedEnv>().basePath("/api");

app.use(
  cors({
    origin: corsHeaders["Access-Control-Allow-Origin"],
    allowHeaders: corsHeaders["Access-Control-Allow-Headers"],
  }),
);

app.use(validateAuth);

app.route("/lobbies", lobbies);
app.route("/profiles", profiles);

Deno.serve(app.fetch);
