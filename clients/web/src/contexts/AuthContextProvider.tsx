import { useEffect, useState } from "react";
import supabase from "@/supabase";
import { AuthContext } from "@/contexts/Auth";
import { type Session } from "@supabase/auth-js";

export default function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Wrap in auth context.
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // This is to prevent token refreshes from "churning" the session state.
      setSession((prev) =>
        prev?.access_token === session?.access_token ? prev : session
      );
    });
    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext value={{ session, loading }}>{children}</AuthContext>;
}
