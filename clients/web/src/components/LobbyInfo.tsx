import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/Auth";
import type { Tables } from "../supabase";
import { UserProfileContext } from "../contexts/UserProfile";
import { getLobby } from "../services/lobbies";
import { getProfile } from "../services/profiles";

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

    getLobby().then((lobby) => {
      if (!lobby) return null;
      setUserLobby(lobby);
      setUserRole(user.id === lobby.host_uid ? "host" : "guest");

      const oppRole = user.id !== lobby.host_uid ? "host" : "guest";

      const id = oppRole === "host" ? lobby.host_uid : lobby.guest_uid;

      if (id) {
        getProfile({ id }).then((res) => setOppProfile(res));
      }
    });
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
