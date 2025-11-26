import { bearerAuth } from "hono/bearer-auth";
import { supabase } from "../supabase.ts";

export const validateAuth = bearerAuth({
  verifyToken: async (token, c) => {
    // Verify token by calling Supabase Auth API
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return false; // invalid token
    c.set("user", data.user); // optionally store user in context
    return true;
  },
});
