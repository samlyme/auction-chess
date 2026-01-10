import { type Result, Ok, Err } from 'shared';
import supabase from '../supabase';

export async function getAuthHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  return { Authorization: `Bearer ${token || ''}` };
}

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function handleApiCall<T>(
  apiCall: () => Promise<Response>
): Promise<Result<T>> {
  try {
    const response = await apiCall();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Err({
        status: response.status,
        message: errorData.message || response.statusText || 'Unknown error',
      });
    }

    // Handle 204 No Content - no response body
    if (response.status === 204) {
      return Ok(null as T);
    }

    const data = await response.json();
    return Ok(data as T);
  } catch (error) {
    return Err({
      status: 0,
      message: error instanceof Error ? error.message : 'Network error',
    });
  }
}
