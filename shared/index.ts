import { z } from "zod";

export const Profile = z.object({
  bio: z.string(),
  created_at: z.string(),
  id: z.string(),
  username: z.string(),
});
export type Profile = z.infer<typeof Profile>;

export const ProfileCreate = z
  .object({
    id: z.string(),
    username: z.string(),
    bio: z.string(),
  })
  .strict();
export type ProfileCreate = z.infer<typeof ProfileCreate>;

export const ProfileUpdate = z
  .object({
    bio: z.string(),
  })
  .strict();
export type ProfileUpdate = z.infer<typeof ProfileUpdate>;

export * from "./database.types.ts";
