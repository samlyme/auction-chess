import BidPanel from "@/components/game/BidPanel";
import { AuctionChessBoard } from "@/components/game/Board";
import LobbyPanel from "@/components/game/LobbyPanel";
import { OutcomeModal } from "@/components/game/OutcomeModal";
import {
  useCountdownTimer,
  type UseCountdownTimerResult,
} from "@/hooks/useCountdownTimer";
import useRealtime from "@/hooks/useRealtime";
import { useLobbyOptions } from "@/queries/lobbies";
import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { type AuctionChessState, type Color } from "shared/types";
import { useProfileOptions } from "@/queries/profiles";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useGameOptions, useTimecheckMutationOptions } from "@/queries/game";

const defaultGameState = {
  chessState: {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  },
  auctionState: {
    balance: {
      white: 0,
      black: 0,
    },
    bidHistory: [],
    minBid: 0,
  },
  timeState: {
    time: {
      white: 0,
      black: 0,
    },
    prev: null,
  },
  turn: "white",
  phase: "bid",
} as AuctionChessState;

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
  const userId = Route.useRouteContext().auth.session.user.id;
  const userProfile = Route.useRouteContext().profile;

  const { lobby: initLobby } = Route.useLoaderData();

  // Use TanStack Query for real-time data instead of manual state management
  const { data: lobby } = useQuery(useLobbyOptions(initLobby));
  const { data: game } = useQuery(useGameOptions());
  const timecheckMutation = useMutation(useTimecheckMutationOptions());

  // Bind the lobby and game to the real time updates.
  useRealtime(userId, initLobby.code);

  // Calculate these values before hooks, with fallbacks for when lobby is null
  const hostColor = lobby?.config.gameConfig.hostColor || "white";
  const opposite = (color: Color) => (color === "white" ? "black" : "white");
  const playerColor =
    lobby && userId === lobby.hostUid ? hostColor : opposite(hostColor);
  const gameStarted = lobby?.gameStarted || false;
  const phase = game?.phase || "bid";

  // TODO: Flatten this request by having the lobbies API return usernames and id.
  const oppId =
    (userId === lobby?.hostUid ? lobby?.guestUid : lobby?.hostUid) || null;
  const { data, error } = useQuery({
    ...useProfileOptions({ id: oppId || "" }),
    enabled: !!oppId,
  });
  if (error) throw error;

  const oppProfile = data || null;

  // All hooks must be called before any early returns
  const initPlayerTime = lobby?.config.gameConfig.timeConfig.enabled
    ? lobby.config.gameConfig.timeConfig.initTime[playerColor]
    : 0;
  const playerTimer = useCountdownTimer({
    durationMs: initPlayerTime,
    onExpire: async () => {
      await timecheckMutation.mutateAsync();
    },
  });

  const initOppTime = lobby?.config.gameConfig.timeConfig.enabled
    ? lobby.config.gameConfig.timeConfig.initTime[opposite(playerColor)]
    : 0;
  const oppTimer = useCountdownTimer({
    durationMs: initOppTime,
    onExpire: async () => {
      await timecheckMutation.mutateAsync();
    },
  });

  // set the timers.
  useEffect(() => {
    if (!lobby) return;

    if (!lobby.gameStarted || !game) {
      // The game isn't started, so use the lobby's config for time.
      playerTimer.reset(initPlayerTime);
      oppTimer.reset(initOppTime);
    } else if (game && game.timeState) {
      const prev = game.timeState.prev || Date.now();
      const now = Date.now();
      const elapsed = now - prev;

      let playerTimeBalance = game.timeState.time[playerColor];
      let oppTimeBalance = game.timeState.time[opposite(playerColor)];

      if (game.turn === playerColor) playerTimeBalance -= elapsed;
      else oppTimeBalance -= elapsed;

      playerTimer.reset(playerTimeBalance);
      oppTimer.reset(oppTimeBalance);

      // NOTE: This is fragile. This assumes that a null prev means the game is started
      if (game.timeState.prev !== null) {
        if (game.turn === playerColor) playerTimer.start();
        else oppTimer.start();
      }
    }
  }, [game, lobby]);

  const timers: Record<Color, UseCountdownTimerResult> =
    playerColor === "white"
      ? { white: playerTimer, black: oppTimer }
      : { white: oppTimer, black: playerTimer };

  // NOW we can do the early return, after all hooks have been called
  if (!lobby) return <Navigate to={"/home"} />;

  return (
    <div className="flex aspect-video w-full justify-center overflow-auto border bg-(--color-background) p-8">
      <div className="grid grid-cols-12 gap-4 p-16">
        <div className="col-span-3">
          <LobbyPanel isHost={userId === lobby.hostUid} lobby={lobby} />
        </div>

        <div
          className={`${!gameStarted || phase !== "move" ? "opacity-50" : ""} col-span-6 flex items-center justify-center`}
        >
          <AuctionChessBoard
            gameState={game || defaultGameState}
            playerColor={playerColor}
          />
        </div>
        <div
          className={`${!gameStarted || phase !== "bid" ? "opacity-50" : ""} col-span-3`}
        >
          <BidPanel
            username={userProfile.username}
            oppUsername={oppProfile?.username}
            playerColor={playerColor}
            gameState={game || defaultGameState}
            timers={timers}
            enableTimers={!!game?.timeState}
          />
        </div>
      </div>
      {game?.outcome && <OutcomeModal outcome={game.outcome} />}
    </div>
  );
}
