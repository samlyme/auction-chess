import { z } from "zod";

// ============================================================================
// Profile types
// ============================================================================

export const Profile = z.object({
  username: z.string(),
  // stop messing with DB naming conventions lol. Just leave it, it's not worth.
  created_at: z.string(),
  id: z.string(),
});
export type Profile = z.infer<typeof Profile>;

export const ProfileCreate = Profile.omit({ created_at: true }).strict();
export type ProfileCreate = z.infer<typeof ProfileCreate>;

// Disable ProfileUpdate at the type level.
export const ProfileUpdate = z
  .object({
    // bio: z.string(),
  })
  .strict();
export type ProfileUpdate = z.infer<typeof ProfileUpdate>;
