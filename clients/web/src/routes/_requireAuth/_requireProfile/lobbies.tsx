import BidPanel from "@/components/game/BidPanel";
import { AuctionChessBoard } from "@/components/game/Board";
import LobbyPanel from "@/components/game/LobbyPanel";
import { OutcomeModal } from "@/components/game/OutcomeModal";
import { useLobbyOptions } from "@/queries/lobbies";
import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import LobbyContextProvider from "@/contexts/LobbyContextProvider";

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
  const { lobby: initLobby } = Route.useLoaderData();

  // Use TanStack Query for real-time data instead of manual state management
  const { data: lobby } = useSuspenseQuery(useLobbyOptions(initLobby));

  // NOW we can do the early return, after all hooks have been called
  if (!lobby) return <Navigate to={"/home"} />;

  return (
    <div className="flex w-full justify-center overflow-auto border bg-(--color-background) p-8">
      <LobbyContextProvider>
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
      </LobbyContextProvider>
    </div>
  );
}
