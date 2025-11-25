import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/Auth";
import type { Tables } from "../supabase";
import supabase from "../supabase";
import { UserProfileContext } from "../contexts/UserProfile";
import { getLobby } from "../services/lobbies";

export default function LobbyInfo() {
  const { session, user, loading: authLoading } = useContext(AuthContext);
  const { profile, loading: profileLoading } = useContext(UserProfileContext);

  const [userRole, setUserRole] = useState<"host" | "guest">("host");
  const [userLobby, setUserLobby] = useState<Tables<"lobbies"> | null>(null);
  const [oppProfile, setOppProfile] = useState<Tables<"profiles"> | null>(null);

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!session || !user || !profile) return;

    console.log(session);

    getLobby()
    .then((res: Tables<"lobbies"> | null) => {
      if (!res) return null;
      setUserLobby(res);
      setUserRole(user.id === res.host_uid ? "host" : "guest");

      const oppRole = user.id !== res.host_uid ? "host" : "guest";
      // TODO: implement this as an actual api lmao.
      supabase.from("profiles").select("*").eq("id", res[`${oppRole}_uid`]).single()
      .then(({data, error}) => {
        if (error) return;
        setOppProfile(data);
      })
      return res;
    })
  }, [session]);

  return (
    <>
      <h1>lobby: {userLobby?.id}</h1>
      <h2>code: {userLobby?.code}</h2>
      <h2>
        host:{" "}
        {userRole == "host" ? (
          <>
            {profile?.username} <em>(you)</em>
          </>
        ) : (
          oppProfile?.username
        )}
      </h2>
      <h2>
        guest:{" "}
        {userRole == "guest" ? (
          <>
            {profile?.username} <em>(you)</em>
          </>
        ) : (
          oppProfile?.username
        )}
      </h2>
    </>
  );
}
