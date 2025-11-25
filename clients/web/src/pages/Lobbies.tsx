import { Link } from "react-router";
import supabase from "../supabase";
import LobbyInfo from "../components/LobbyInfo";
import LobbySearch from "../components/LobbySearch";
import LobbyMenu from "../components/LobbyMenu";
import { useContext } from "react";
import { LobbyContext } from "../contexts/Lobby";

export default function Lobbies() {
  const {lobby} = useContext(LobbyContext);

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
          <LobbyInfo />
          <LobbyMenu />
        </>
      ) : (
        <>
          <LobbySearch />
        </>
      )}

      <button onClick={() => supabase.auth.signOut()}>sign out</button>
    </>
  );
}
