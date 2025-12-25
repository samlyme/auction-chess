import { Link } from "react-router";
import supabase from "../supabase";
import LobbyInfo from "../components/LobbyInfo";
import LobbySearch from "../components/LobbySearch";
import LobbyMenu from "../components/LobbyMenu";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/Auth";
import { UserProfileContext } from "../contexts/UserProfile";
import type { Tables, Color, Bid, NormalMove } from "shared";
import { getProfile } from "../services/profiles";
import { makeBid, makeMove } from "../services/game";
import { AuctionChessBoard } from "../components/game/Board";
import useRealtime from "../hooks/useRealtime";

export default function Lobbies() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { profile, loading: profileLoading } = useContext(UserProfileContext);

  const { lobby, gameState, loading: realtimeLoading, setLobby } = useRealtime();

  const [host, setHost] = useState<Tables<"profiles"> | null>(null);
  const [guest, setGuest] = useState<Tables<"profiles"> | null>(null);
  const [role, setRole] = useState<"host" | "guest">("host");
  const [playerColor, setPlayerColor] = useState<Color>("white");

  useEffect(() => {
    if (!lobby || !user || !profile) return;

    const { host_uid, guest_uid, config } = lobby;
    if (!guest_uid) setGuest(null);

    if (user.id === host_uid) {
      setRole("host");
      setHost(profile);
      setPlayerColor(config.hostColor);

      if (guest_uid) {
        getProfile({ id: guest_uid })
          .then(setGuest)
          .catch((error) => console.error("Failed to load guest profile:", error));
      }
    } else if (guest_uid && user.id === guest_uid) {
      setRole("guest");
      setGuest(profile);
      setPlayerColor(config.hostColor === "white" ? "black" : "white");

      getProfile({ id: host_uid })
        .then(setHost)
        .catch((error) => console.error("Failed to load host profile:", error));
    }
  }, [lobby, user, profile, realtimeLoading, authLoading, profileLoading]);

  const handleMakeBid = async (bid: Bid) => {
    try {
      await makeBid(bid);
      // State will update via real-time subscription
    } catch (error) {
      alert(`Error making bid: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleMakeMove = async (move: NormalMove) => {
    try {
      await makeMove(move);
      // State will update via real-time subscription
    } catch (error) {
      alert(`Error making move: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

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
          {gameState ? (
            <>
            <h2>Phase: {gameState.phase}</h2>
            <h2>Turn: {gameState.turn}</h2>
            <AuctionChessBoard
              gameState={gameState}
              playerColor={playerColor}
              hostUsername={host?.username ?? "Host"}
              guestUsername={guest?.username ?? "Guest"}
              onMakeMove={handleMakeMove}
              onMakeBid={handleMakeBid}
            />
            </>
          ) : (
            <LobbyInfo
              lobby={lobby}
              hostProfile={host}
              guestProfile={guest}
              userRole={role}
            />
          )}
          <LobbyMenu lobby={lobby} setLobby={setLobby} />
        </>
      ) : (
        <LobbySearch setLobby={setLobby} />
      )}

      <button onClick={() => supabase.auth.signOut()}>sign out</button>
    </>
  );
}
