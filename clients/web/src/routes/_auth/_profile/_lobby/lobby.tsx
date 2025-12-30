import { createFileRoute, redirect } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import supabase from "@/supabase";
import LobbyInfo from "@/components/lobby/Info";
import LobbySearch from "@/components/lobby/Search";
import LobbyMenu from "@/components/lobby/Menu";
import type { Bid, NormalMove } from "shared";
import { makeBid, makeMove } from "@/services/game";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/services/profiles";

export const Route = createFileRoute("/_auth/_profile/_lobby/lobby")({
  loader: async ({ context }) => {
    const playerId = context.auth.session?.user.id;
    const lobby = context.lobby;
    if (!lobby) throw redirect({ to: "/home" })

    const userRole: "host" | "guest" =
      playerId === lobby?.hostUid ? "host" : "guest";
    if (userRole === "host") {
      const hostProfile = context.profile;
      if (lobby.guestUid) {
        const res = await getProfile({ id: lobby.guestUid });
        if (!res.ok) throw new Error("lmaooo");
        const guestProfile = res.value;
        return { hostProfile, guestProfile, userRole };
      }
      return { hostProfile, guestProfile: null, userRole };
    } else {
      const guestProfile = context.profile;
      const res = await getProfile({ id: lobby.hostUid });
      if (!res.ok) throw new Error("lmaooo");
      const hostProfile = res.value;
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

  const { lobby } = Route.useRouteContext();
  const { hostProfile, guestProfile, userRole } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
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
            {/* {gameState ? (
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
            )} */}
            <LobbyInfo
              lobby={lobby}
              hostProfile={hostProfile}
              guestProfile={guestProfile}
              userRole={userRole}
            />
            {/* TODO: Implement the set lobby. Probably should use the router's cache sytstem? */}
            <LobbyMenu lobby={lobby} setLobby={() => {}} />
          </div>
        ) : (
          <LobbySearch setLobby={() => {}} />
        )}
      </div>
    </div>
  );
}
