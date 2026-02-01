import BidPanel from "@/components/game/BidPanel";
import { AuctionChessBoard } from "@/components/game/Board";
import LobbyPanel from "@/components/game/LobbyPanel";
import { OutcomeModal } from "@/components/game/OutcomeModal";
import { useLobbyOptions } from "@/queries/lobbies";
import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import LobbyContextProvider from "@/contexts/LobbyContextProvider";
import GameContextProvider from "@/contexts/GameContextProvider";
import RealtimeContextProvder from "@/contexts/RealtimeContextProvider";

export const Route = createFileRoute("/_requireAuth/_requireProfile/lobbies")({
  loader: async ({ context }) => {
    const { queryClient } = context;

    const lobby = await queryClient.ensureQueryData(useLobbyOptions());
    if (!lobby) throw redirect({ to: "/home" });

    return { lobby };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { lobby } = Route.useLoaderData();
  const userId = Route.useRouteContext().auth.session.user.id;

  return (
    <div className="flex w-full justify-center overflow-auto border bg-(--color-background) p-8">
      {/* This is dependent on routing! When leaving lobbies, take care to leave /lobbies */}
      <RealtimeContextProvder userId={userId} lobbyCode={lobby.code}>
        <LobbyContextProvider>
          <GameContextProvider>
            <div className="grid grid-cols-12 gap-4 p-16">
              <div className="col-span-3">
                <LobbyPanel />
              </div>

              <div className={`col-span-6 flex items-center justify-center`}>
                <AuctionChessBoard />
              </div>
              <div className={`col-span-3`}>
                <BidPanel />
              </div>
            </div>
            <OutcomeModal />
          </GameContextProvider>
        </LobbyContextProvider>
      </RealtimeContextProvder>
    </div>
  );
}
