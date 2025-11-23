import { useContext, useEffect, useState } from "react";
import { UserProfileContext } from "../contexts/UserProfile";
import type { Tables } from "../supabase";
import { AuthContext } from "../contexts/Auth";
import supabase from "../supabase";

export default function UserProfileContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userProfile, setUserProfile] = useState<Tables<"profiles"> | null>(
    null
  );
  const [prevTime, setPrevTime] = useState<number | null>(null);
  const { session, loading: authLoading } = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!session || authLoading) return;

    (async () => {
      setLoading(true);
      try{
        const { data } = await supabase
          .from("profiles")
          .select()
          .eq("id", session.user.id)
          .single();
        setUserProfile(data)
      }
      catch {
        setUserProfile(null)
      }
      finally {
        setLoading(false)
      }
    })();

  }, [session, authLoading, prevTime]);

  return (
    <UserProfileContext
      value={{
        profile: userProfile,
        invalidate: () => setPrevTime(Date.now()),
        loading,
      }}
    >
      {children}
    </UserProfileContext>
  );
}
