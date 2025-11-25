import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/Auth";
import { UserProfileContext } from "../contexts/UserProfile";
import { getProfile } from "../services/profiles";
import { LobbyContext } from "../contexts/Lobby";
import type { Tables } from "shared";

export default function LobbyInfo() {
  const { lobby, loading: lobbyLoading } = useContext(LobbyContext);
  const { profile, loading: profileLoading } = useContext(UserProfileContext);
  const { user, loading: authLoading } = useContext(AuthContext);

  const [userRole, setUserRole] = useState<"host" | "guest">("host");
  const [oppProfile, setOppProfile] = useState<Tables<"profiles"> | null>(null);

  useEffect(() => {
    if (lobbyLoading || profileLoading || !lobby || !profile || !user) return;

    (async () => {
      const { host_uid, guest_uid } = lobby;
      const role = user.id === host_uid ? "host" : "guest";
      setUserRole(role);

      if (role === "host") {
        const opp = guest_uid ? await getProfile({ id: guest_uid }) : null;
        setOppProfile(opp);
      } else if (role === "guest") {
        const opp = await getProfile({ id: host_uid });
        setOppProfile(opp);
      }
    })();
  }, [lobby, lobbyLoading, profile, profileLoading, user, authLoading]);

  return (
    <>
      <h1>lobby: {lobby?.id}</h1>
      <h2>code: {lobby?.code}</h2>
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
