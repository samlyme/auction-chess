import { createApp } from "./app";
import { createClient } from "@supabase/supabase-js";
import process from "node:process";

export const supabase = createClient(
  process.env["SUPABASE_URL"]!,
  // supabase service role key works here
  // secret key doesn't.
  process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
);

const app = createApp(supabase);

export default {
  port: 8000,
  fetch: app.fetch,
};
