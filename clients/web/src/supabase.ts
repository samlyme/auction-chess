import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUB_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
export type {
  Database,
  Tables,
  Enums,
} from "../../../supabase/functions/_shared/database.types";
