import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  // supabase service role key works here
  // secret key doesn't.
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
