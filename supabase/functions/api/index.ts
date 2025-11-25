import "@supabase/functions-js";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";
import { corsHeaders } from "../_shared/cors.ts";
import { supabase } from "./supabase.ts";
import { lobbies } from "./routes/lobbies.ts";
import { AuthedEnv } from "./types.ts";
import { profiles } from "./routes/profiles.ts";


const app = new Hono<AuthedEnv>().basePath("/api");

app.use(
  cors({
    origin: corsHeaders["Access-Control-Allow-Origin"],
    allowHeaders: corsHeaders["Access-Control-Allow-Headers"],
  })
);

app.use(
  bearerAuth({
    verifyToken: async (token, c) => {
      // Verify token by calling Supabase Auth API
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) return false; // invalid token
      c.set("user", data.user); // optionally store user in context
      return true;
    },
  })
);

app.route("/lobbies", lobbies)
app.route("/profiles", profiles)

Deno.serve(app.fetch)
