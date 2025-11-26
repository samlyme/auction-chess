import { Context } from "hono";
import { supabase } from "../supabase.ts";
import { MaybeProfileEnv } from "../types.ts";
import { Next } from "hono/types";

export const getProfile = async (c: Context<MaybeProfileEnv>, next: Next) => {
  const user = c.get("user");
  const { data } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .maybeSingle();

  c.set("profile", data);
  await next();
};

export const validateProfile = async (
  c: Context<MaybeProfileEnv>,
  next: Next,
) => {
  const profile = c.get("profile");
  if (!profile) return c.json({ message: "no profile" }, 400);
  await next();
};
