import { getRouteApi, Navigate } from "@tanstack/react-router";
import { LobbyContext } from "./Lobby";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLobbyOptions } from "@/queries/lobbies";
import { useGameOptions, useTimecheckMutationOptions } from "@/queries/game";
import useRealtime from "@/hooks/useRealtime";
import type { AuctionChessState, Color } from "shared/types/game";
import { useProfileOptions } from "@/queries/profiles";
import {
  useCountdownTimer,
  type UseCountdownTimerResult,
} from "@/hooks/useCountdownTimer";
import { useEffect, useRef } from "react";
import { createGame } from "shared/game/auctionChess";
import usePrevious from "@/hooks/usePrevious";

const Route = getRouteApi("/_requireAuth/_requireProfile/lobbies");

export default function LobbyContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = Route.useRouteContext().auth.session.user.id;
  const userProfile = Route.useRouteContext().profile;

  const { lobby: initLobby } = Route.useLoaderData();

  // Use TanStack Query for real-time data instead of manual state management
  const { data: lobby } = useQuery(useLobbyOptions(initLobby));
  const { data: game } = useQuery(useGameOptions());
  const timecheckMutation = useMutation(useTimecheckMutationOptions());

  // Bind the lobby and game to the real time updates.
  useRealtime(userId, initLobby.code);
  const prevGameState = usePrevious(game) || null;

  // Calculate these values before hooks, with fallbacks for when lobby is null
  const hostColor = lobby?.config.gameConfig.hostColor || "white";
  const opposite = (color: Color) => (color === "white" ? "black" : "white");
  const playerColor =
    lobby && userId === lobby.hostUid ? hostColor : opposite(hostColor);

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

  if (!lobby) return <Navigate to={"/home"} />;

  const defaultGameState = createGame(lobby.config.gameConfig);

  const timers: Record<Color, UseCountdownTimerResult> =
    playerColor === "white"
      ? { white: playerTimer, black: oppTimer }
      : { white: oppTimer, black: playerTimer };

  return (
    <LobbyContext
      value={{
        gameState: game,
        defaultGameState: defaultGameState,
        prevGameState,
        timers,
        playerColor,
        oppProfile,
        userProfile,
        lobby,
        userId,
      }}
    >
      {children}
    </LobbyContext>
  );
}
