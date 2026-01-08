import { z } from 'zod';

export const DesiredRouteSearchParam = z.object({
  redirect: z.string().optional().catch(''),
});
export type DesiredRouteSearchParam = z.infer<typeof DesiredRouteSearchParam>;

// TODO: make this type not optional
export const LobbyCodeSearchParam = z.object({
  code: z.string(),
});
export type LobbyCodeSearchParam = z.infer<typeof LobbyCodeSearchParam>;
