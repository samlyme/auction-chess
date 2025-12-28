import { Link } from "react-router";
import supabase from "../supabase";
import LobbyInfo from "../components/lobby/Info";
import LobbySearch from "../components/lobby/Search";
import LobbyMenu from "../components/lobby/Menu";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/Auth";
import { UserProfileContext } from "../contexts/UserProfile";
import type { Color, Bid, NormalMove, Profile } from "shared";
import { getProfile } from "../services/profiles";
import { makeBid, makeMove } from "../services/game";
import { AuctionChessBoard } from "../components/game/Board";
import useRealtime from "../hooks/useRealtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      setPlayerColor(config.gameConfig.hostColor);

      if (guestUid) {
        getProfile({ id: guestUid })
          .then(setGuest)
          .catch((error) => console.error("Failed to load guest profile:", error));
      }
    } else if (guestUid && user.id === guestUid) {
      setRole("guest");
      setGuest(profile);
      setPlayerColor(config.gameConfig.hostColor === "white" ? "black" : "white");

      getProfile({ id: hostUid })
        .then(setHost)
        .catch((error) => console.error("Failed to load host profile:", error));
    }
  }, [lobby, user, profile, realtimeLoading, authLoading, profileLoading]);

  const handleMakeBid = async (bid: Bid) => {
    try {
      await makeBid(bid);
    } catch (error) {
      alert(`Error making bid: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleMakeMove = async (move: NormalMove) => {
    try {
      await makeMove(move);
    } catch (error) {
      alert(`Error making move: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Auction Chess</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={"/profile/me"}>Profile</Link>
            </Button>
            <Button variant="secondary" onClick={() => supabase.auth.signOut()}>
              Sign Out
            </Button>
          </div>
        </div>

        {lobby ? (
          <div className="space-y-4">
            {gameState ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Game in Progress - Phase: {gameState.phase} | Turn: {gameState.turn}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AuctionChessBoard
                    gameState={gameState}
                    playerColor={playerColor}
                    hostUsername={host?.username ?? "Host"}
                    guestUsername={guest?.username ?? "Guest"}
                    onMakeMove={handleMakeMove}
                    onMakeBid={handleMakeBid}
                  />
                </CardContent>
              </Card>
            ) : (
              <LobbyInfo
                lobby={lobby}
                hostProfile={host}
                guestProfile={guest}
                userRole={role}
              />
            )}
            <LobbyMenu lobby={lobby} setLobby={setLobby} />
          </div>
        ) : (
          <LobbySearch setLobby={setLobby} />
        )}
      </div>
    </div>
  );
}
