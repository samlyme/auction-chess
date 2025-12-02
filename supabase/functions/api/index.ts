import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { createApp } from "server/app.ts";
import type { Database } from "shared";

// Create Deno-compatible Supabase client
const supabase = createClient<Database>(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Create the app with the Supabase client
const app = createApp(supabase);

// Serve the app
Deno.serve(app.fetch);
