import { bearerAuth } from "hono/bearer-auth";
import { endTime, startTime } from "hono/timing";

export const validateAuth = bearerAuth({
  verifyToken: async (token, c) => {
    // Verify token by calling Supabase Auth API
    // TODO: implement this locally with JWT
    const supabase = c.get("supabase");

    startTime(c, "validateAuth");
    const { data, error } = await supabase.auth.getUser(token);
    endTime(c, "validateAuth");

    if (error || !data.user) return false; // invalid token
    c.set("user", data.user); // optionally store user in context
    return true;
  },
});
