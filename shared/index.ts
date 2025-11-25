import { z } from "zod";

export const UserProfile = z.object({
  id: z.string(),
  username: z.string(),
  bio: z.string()
})
