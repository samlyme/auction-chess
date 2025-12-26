import { Link } from "react-router";
import supabase from "../supabase";
import LobbyInfo from "../components/LobbyInfo";
import LobbySearch from "../components/LobbySearch";
import LobbyMenu from "../components/LobbyMenu";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/Auth";
import { UserProfileContext } from "../contexts/UserProfile";
import type { Color, Bid, NormalMove, Profile } from "shared";
import { getProfile } from "../services/profiles";
import { makeBid, makeMove } from "../services/game";
import { AuctionChessBoard } from "../components/game/Board";
import useRealtime from "../hooks/useRealtime";

export default function Lobbies() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { profile, loading: profileLoading } = useContext(UserProfileContext);

  const { lobby, gameState, loading: realtimeLoading, setLobby } = useRealtime();

  const [host, setHost] = useState<Profile | null>(null);
  const [guest, setGuest] = useState<Profile | null>(null);
  const [role, setRole] = useState<"host" | "guest">("host");
  const [playerColor, setPlayerColor] = useState<Color>("white");

  useEffect(() => {
    if (!lobby || !user || !profile) return;

    const { hostUid, guestUid, config } = lobby;
    if (!guestUid) setGuest(null);

    if (user.id === hostUid) {
      setRole("host");
      setHost(profile);
      setPlayerColor(config.hostColor);

      if (guestUid) {
        getProfile({ id: guestUid })
          .then(setGuest)
          .catch((error) => console.error("Failed to load guest profile:", error));
      }
    } else if (guestUid && user.id === guestUid) {
      setRole("guest");
      setGuest(profile);
      setPlayerColor(config.hostColor === "white" ? "black" : "white");

      getProfile({ id: hostUid })
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
