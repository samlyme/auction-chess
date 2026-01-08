import type { MiddlewareHandler } from "hono";
import type { CompleteProfileEnv, MaybeProfileEnv } from "../types/honoEnvs.ts";
import { endTime, startTime } from "hono/timing";

export const getProfile: MiddlewareHandler<MaybeProfileEnv> = async (
  c,
  next,
) => {
  // TODO: implement LRU cache for user profiles.
  const supabase = c.get("supabase");
  const user = c.get("user");

  startTime(c, "getProfile");

  const { data } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .maybeSingle();

  endTime(c, "getProfile")

  c.set("profile", data);
  await next();
};

export const validateProfile: MiddlewareHandler<CompleteProfileEnv> = async (
  c,
  next,
) => {
  const profile = c.get("profile");
  if (!profile) return c.json({ message: "no profile" }, 400);
  await next();
};
