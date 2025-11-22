import { useEffect, useState } from "react";
import supabase from "../supabase";
import { AuthContext } from "../contexts/Auth";
import { type User, type Session } from "@supabase/auth-js";

export default function AuthContextProvider({ children }: { children: React.ReactNode}) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Wrap in auth context.
  useEffect(() => {
    Promise.all(
      [
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
        }),
        supabase.auth.getUser().then(({data: {user}}) => {
          setUser(user)
        })
      ]
    )
    .then(() => setLoading(false))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("auth state changed");
      
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);


  return (
    <AuthContext value={{session, user, loading}}>
      { children }
    </AuthContext>
    
  )
}