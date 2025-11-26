import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env["SUPABASE_URL"]!,
  // supabase service role key works here
  // secret key doesn't.
  process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
);
