import { useContext, useEffect, useState } from "react";
import { UserProfileContext } from "../contexts/UserProfile";
import type { Tables } from "../supabase";
import { AuthContext } from "../contexts/Auth";
import supabase from "../supabase";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

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
    supabase
      .from("profiles")
      .select()
      .eq("id", session.user.id)
      .single()
      .then(({ data, error }: PostgrestSingleResponse<Tables<"profiles">>) => {
        if (error) {
          console.log(error);
          throw new Error("error in fetching user profile");
        }
        setLoading(false);
        setUserProfile(data);
      });
  }, [session, prevTime]);

  return (
    <UserProfileContext value={
      { profile: userProfile, invalidate: () => setPrevTime(Date.now()), loading }
    }>{children}</UserProfileContext>
  );
}
