import { useContext, useEffect, useState } from "react";
import { UserProfileContext } from "../../contexts/UserProfile";
import type { Tables } from "../../supabase";
import { AuthContext } from "../../contexts/Auth";
import { getProfile } from "../../services/profiles";

export default function UserProfileContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [prevTime, setPrevTime] = useState<number | null>(null);
  const { session, loading: authLoading } = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!session || authLoading) return;

    (async () => {
      setLoading(true);
      const profile = await getProfile();
      setProfile(profile);
      setLoading(false);
    })();
  }, [session, authLoading, prevTime]);

  return (
    <UserProfileContext
      value={{
        profile,
        update: () => setPrevTime(Date.now()),
        loading,
      }}
    >
      {children}
    </UserProfileContext>
  );
}
