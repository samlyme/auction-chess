import supabase from "../supabase";

export async function getAuthHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  return { Authorization: `Bearer ${token || ""}` };
}
