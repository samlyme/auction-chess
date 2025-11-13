import { useEffect, useState } from "react";
import supabase from "../supabase";
import { AuthContext } from "../contexts/Auth";
import type { Session } from "@supabase/auth-js";

export default function AuthContextProvider({ children }: { children: React.ReactNode}) {
  const [session, setSession] = useState<Session | null>(null);

  // Wrap in auth context.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);


  return (
    <AuthContext value={session}>
      { children }
    </AuthContext>
    
  )
}