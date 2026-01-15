import { hc } from 'hono/client';
import type { AppType } from 'server/app';
import supabase from '@/supabase';

export async function getAuthHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  return { Authorization: `Bearer ${token || ''}` };
}

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const api = hc<AppType>(BACKEND_URL || '', {
  headers: async () => await getAuthHeader(),
}).api;
