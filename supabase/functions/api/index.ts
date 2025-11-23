import "@supabase/functions-js";
import { Context, Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";
import { corsHeaders } from "../_shared/cors.ts";
import { supabase } from "./supabase.ts";
import { CompleteEnv } from "./types.ts";
import { lobbies } from "./routes/lobbies.ts";


const app = new Hono().basePath("/api");

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

app.use(async (c: Context<CompleteEnv>, next) => {
  const user = c.get("user");
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  if (error) return c.json({ message: "no profile" }, 400);
  c.set('profile', data);
  await next();
});

app.route("/lobbies", lobbies)

Deno.serve(app.fetch)