import { hc } from 'hono/client';
import type { AppType } from 'server/app';
import { getAuthHeader, BACKEND_URL } from './utils';

export const api = hc<AppType>(BACKEND_URL || '', {
  headers: async () => await getAuthHeader(),
});
