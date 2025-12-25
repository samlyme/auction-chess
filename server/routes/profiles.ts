import { Hono } from "hono";
import { type MaybeProfileEnv } from "../types.ts";
import { Profile, ProfileCreate } from "shared";
import { ProfileUpdate } from "shared";
import { getProfile, validateProfile } from "../middleware/profiles.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";

const route = new Hono<MaybeProfileEnv>()

  .use(getProfile)

  .get(
    "/",
    zValidator(
      "query",
      z.union([
        z.object({ username: z.string() }),
        z.object({ id: z.string() }),
      ]),
    ),
    async (c) => {
      const supabase = c.get("supabase");
      const query = c.req.valid("query");

      if ("id" in query) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", query.id)
          .maybeSingle();

        if (error)
          throw new HTTPException(500, {
            message: "error in fetching user profile",
          });
        return c.json(Profile.nullable().parse(data));
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", query.username)
        .maybeSingle();
      if (error)
        throw new HTTPException(500, {
          message: "error in fetching user profile",
        });

      return c.json(Profile.nullable().parse(data));
    },
  )

  .get("/me", (c) => {
    return c.json(c.get("profile") || null);
  })

  .post("/", zValidator("json", ProfileCreate), async (c) => {
    const supabase = c.get("supabase");
    const profile = c.get("profile");
    if (profile)
      throw new HTTPException(400, { message: "profile already created" });

    // zValidator isn't playing nice :(
    const body = c.req.valid("json");

    const user = c.get("user");
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        ...body,
        id: user.id,
      })
      .select()
      .single();
    if (error)
      throw new HTTPException(500, { message: "Failed to create profile" });

    const res = Profile.parse(data);

    return c.json(res);
  })

  .patch("/", validateProfile, zValidator("json", ProfileUpdate), async (c) => {
    const supabase = c.get("supabase");
    const user = c.get("user");
    const body = c.req.valid("json");

    const { data, error } = await supabase
      .from("profiles")
      .update(body)
      .eq("id", user.id)
      .select()
      .single();

    if (error)
      throw new HTTPException(500, { message: "error updating user profile" });

    return c.json(Profile.parse(data));
  });

export { route as profiles };
