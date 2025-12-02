import type { MiddlewareHandler } from "hono";
import type { CompleteProfileEnv, MaybeProfileEnv } from "../types.ts";

export const getProfile: MiddlewareHandler<MaybeProfileEnv> = async (
  c,
  next,
) => {
  const supabase = c.get("supabase");
  const user = c.get("user");
  const { data } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .maybeSingle();

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
