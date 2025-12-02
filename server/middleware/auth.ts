import { bearerAuth } from "hono/bearer-auth";

export const validateAuth = bearerAuth({
  verifyToken: async (token, c) => {
    // Verify token by calling Supabase Auth API
    const supabase = c.get("supabase");
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return false; // invalid token
    c.set("user", data.user); // optionally store user in context
    return true;
  },
});
