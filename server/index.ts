import { createApp } from "./app";
import { supabase } from "./supabase";

const app = createApp(supabase);

export default {
  port: 8000,
  fetch: app.fetch,
};
