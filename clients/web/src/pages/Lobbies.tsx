import { Link } from "react-router";
import supabase from "../supabase";
import LobbyInfo from "../components/LobbyInfo";
import LobbySearch from "../components/LobbySearch";
import LobbyMenu from "../components/LobbyMenu";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/Auth";
import { UserProfileContext } from "../contexts/UserProfile";
import type { Tables } from "shared";
import { getProfile } from "../services/profiles";
import useLobbies from "../hooks/useLobbies";

export default function Lobbies() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { profile, loading: profileLoading } = useContext(UserProfileContext);

  const { lobby, loading: lobbyLoading, update } = useLobbies();

  const [host, setHost] = useState<Tables<"profiles"> | null>(null);
  const [guest, setGuest] = useState<Tables<"profiles"> | null>(null);
  const [role, setRole] = useState<"host" | "guest">("host");

  useEffect(() => {
    if (!lobby || !user || !profile) return;

    const { host_uid, guest_uid } = lobby;
    if (!guest_uid) setGuest(null);

    if (user.id === host_uid) {
      setRole("host");
      setHost(profile);

      if (guest_uid) {
        getProfile({ id: guest_uid }).then(setGuest);
      }
    } else if (guest_uid && user.id === guest_uid) {
      setRole("guest");
      setGuest(profile);

      getProfile({ id: host_uid }).then(setHost);
    }
  }, [lobby, user, profile, lobbyLoading, authLoading, profileLoading]);

  return (
    <>
      <h1>Lobbies</h1>

      <h2>
        <Link to={"/profile/me"} replace>
          User Profile
        </Link>
      </h2>

      {lobby ? (
        <>
          <LobbyInfo
            lobby={lobby}
            hostProfile={host}
            guestProfile={guest}
            userRole={role}
          />
          <LobbyMenu lobby={lobby} update={update} />
        </>
      ) : (
        <>
          <LobbySearch update={update} />
        </>
      )}

      <button onClick={() => supabase.auth.signOut()}>sign out</button>
    </>
  );
}
