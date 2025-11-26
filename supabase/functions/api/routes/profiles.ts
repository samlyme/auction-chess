import { Hono } from "hono";
import { MaybeProfileEnv } from "../types.ts";
import { supabase } from "../supabase.ts";
import { zValidator } from "@hono/zod-validator";
import { ProfileCreate } from "shared";
import { ProfileUpdate } from "shared";
import { getProfile, validateProfile } from "../middleware/profiles.ts";
import { z } from "zod";

const app = new Hono<MaybeProfileEnv>();

app.use(getProfile);

app.get(
  "/",
  zValidator(
    "query",
    z.union([z.object({ username: z.string() }), z.object({ id: z.string() })]),
  ),
  async (c) => {
    const query = c.req.valid("query");

    if ("id" in query) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", query.id)
        .maybeSingle();

      if (error)
        return c.json(
          { message: "error in fetching user profile", error },
          500,
        );
      return c.json(data);
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", query.username)
      .maybeSingle();
    if (error)
      return c.json({ message: "error in fetching user profile", error }, 500);
    return c.json(data);
  },
);

app.get("/me", validateProfile, (c) => {
  return c.json(c.get("profile"));
});

app.post("/", zValidator("json", ProfileCreate), async (c) => {
  const profile = c.get("profile");
  if (profile) return c.json({ message: "profile already created" }, 400);

  const body = c.req.valid("json");

  const user = c.get("user");
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      ...body,
    })
    .select();

  if (error) return c.json({ message: "profile create failed", error }, 500);

  return c.json(data);
});

app.patch(
  "/",
  validateProfile,
  zValidator("json", ProfileUpdate),
  async (c) => {
    const user = c.get("user");
    const body = c.req.valid("json");

    const { data, error } = await supabase
      .from("profiles")
      .update(body)
      .eq("id", user.id)
      .select()
      .single();

    if (error)
      return c.json({ message: "error updating user profile", error }, 500);

    return c.json(data);
  },
);

export { app as profiles };
