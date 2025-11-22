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
  const [loading, setLoading] = useState<boolean>(true);
  const {session} = useContext(AuthContext);

  useEffect(() => {
    if (!session) return;
    
    const fetchUserProfile = async () => {
      const {data} = await supabase
        .from("profiles")
        .select()
        .eq("id", session.user.id)
        .single();

        setUserProfile(data)
        setLoading(false);
    }

    fetchUserProfile()
  }, [session, prevTime]);

  return (
    <UserProfileContext value={
      { profile: userProfile, invalidate: () => setPrevTime(Date.now()), loading }
    }>{children}</UserProfileContext>
  );
}
