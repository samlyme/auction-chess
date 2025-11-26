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

export const Lobby = z.object({
  code: z.string(),
  config: z.object(), // TODO: define lobby config
  created_at: z.string(),
  game_state: z.object().nullable(),
  guest_uid: z.string().nullable(),
  host_uid: z.string(),
  id: z.number(),
});
export type Lobby = z.infer<typeof Lobby>;

export const LobbyJoinQuery = z.object({
  code: z.string()
})
export type LobbyJoin = z.infer<typeof LobbyJoinQuery>;

export * from "./database.types.ts";
