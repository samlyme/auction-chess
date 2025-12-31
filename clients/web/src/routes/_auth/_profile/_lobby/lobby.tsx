import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import supabase from "@/supabase";
import LobbyInfo from "@/components/lobby/Info";
import LobbyMenu from "@/components/lobby/Menu";
import type { Bid, Color, NormalMove } from "shared";
import { makeBid, makeMove } from "@/services/game";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/services/profiles";
import { LobbyCodeSearchParam } from "@/routes/-types";
import { joinLobby } from "@/services/lobbies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuctionChessBoard } from "@/components/game/Board";
import useRealtime from "@/hooks/useRealtime";

export const Route = createFileRoute("/_auth/_profile/_lobby/lobby")({
  validateSearch: LobbyCodeSearchParam,
  beforeLoad: async ({ context: { lobby }, search: { code } }) => {
    // a bit of code repetition to make typechecker happy.
    if (lobby && lobby.code !== code) {
      throw redirect({ to: "/leave-old-lobby", search: { code } });
    }

    if (!lobby) {
      const res = await joinLobby(code)
      if (!res.ok) {
        if (res.error.status == 404) throw redirect({to: "/home"})
        throw new Error(res.error.message);
      }
      return { lobby: res.value };
    }
    return { lobby }
  },
  loader: async ({ context }) => {
    const playerId = context.auth.session.user.id;
    const lobby = context.lobby;
    if (!lobby) throw redirect({ to: "/home" });

    const userRole: "host" | "guest" =
      playerId === lobby?.hostUid ? "host" : "guest";
    if (userRole === "host") {
      const hostProfile = context.profile;
      if (lobby.guestUid) {
        const res = await getProfile({ id: lobby.guestUid });
        if (!res.ok) throw new Error(res.error.message);
        const guestProfile = res.value;
        return { hostProfile, guestProfile, userRole };
      }
      return { hostProfile, guestProfile: null, userRole };
    } else {
      const guestProfile = context.profile;
      const res = await getProfile({ id: lobby.hostUid });
      if (!res.ok) throw new Error(res.error.message);
      const hostProfile = res.value;
      if (hostProfile === null) throw new Error("Host of lobby can not be null.")
      return { hostProfile, guestProfile, userRole };
    }
  },
  component: Lobbies,
});

function Lobbies() {
  const handleMakeBid = async (bid: Bid) => {
    try {
      await makeBid(bid);
    } catch (error) {
      alert(
        `Error making bid: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleMakeMove = async (move: NormalMove) => {
    try {
      await makeMove(move);
    } catch (error) {
      alert(
        `Error making move: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const context = Route.useRouteContext();
  const { hostProfile, guestProfile, userRole } = Route.useLoaderData();
  // get gamestate in beforeLoad or loader
  const { lobby, gameState } = useRealtime(context.auth.session.user, context.lobby, null);

  const opp = (color: Color) => color === "white" ? "black" : "white";
  const hostColor = lobby?.config.gameConfig.hostColor || "white";
  const playerColor = userRole === "host" ? hostColor : opp(hostColor);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className={`${gameState ? "max-w-7xl" : "max-w-2xl"} mx-auto space-y-4`}>
        {/* TODO: Refactor this to the root layout. */}
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
            {/* TODO: get the gameState data */}
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
                    hostUsername={hostProfile.username ?? "Host"}
                    guestUsername={guestProfile?.username ?? "Guest"}
                    onMakeMove={handleMakeMove}
                    onMakeBid={handleMakeBid}
                  />
                </CardContent>
              </Card>
            ) : (
              <LobbyInfo
                lobby={lobby}
                hostProfile={hostProfile}
                guestProfile={guestProfile}
                userRole={userRole}
              />
            )}
            <LobbyMenu lobby={lobby} setLobby={() => {}} />
          </div>
        ) : (
          <Navigate to="/home" />
        )}
      </div>
    </div>
  );
}
