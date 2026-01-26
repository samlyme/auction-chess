import { getRouteApi, Navigate } from "@tanstack/react-router";
import { LobbyContext, type LobbyContextType } from "./Lobby";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useLobbyOptions } from "@/queries/lobbies";
import { useGameOptions, useTimecheckMutationOptions } from "@/queries/game";
// import useRealtime from "@/hooks/useRealtime";
import type { AuctionChessState, Color } from "shared/types/game";
import { useProfileOptions } from "@/queries/profiles";
import {
  useCountdownTimer,
  type UseCountdownTimerResult,
} from "@/hooks/useCountdownTimer";
import { useEffect, useRef } from "react";
import { createGame } from "shared/game/utils";
import { opposite } from "@/utils";

const Route = getRouteApi("/_requireAuth/_requireProfile/lobbies");

export default function LobbyContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = Route.useRouteContext().auth.session.user.id;

  const { lobby: initLobby } = Route.useLoaderData();
  const isHost = userId === initLobby.hostUid; // can't change hosts, so this is fine!

  // Use TanStack Query for real-time data instead of manual state management
  const { data: lobby } = useSuspenseQuery(useLobbyOptions(initLobby));
  const { data: game } = useSuspenseQuery(useGameOptions());

  // Bind the lobby and game to the real time updates.
  // useRealtime(userId, initLobby.code);

  // Calculate these values before hooks, with fallbacks for when lobby is null
  const hostColor = lobby?.config.gameConfig.hostColor || "white";
  const playerColor =
    lobby && userId === lobby.hostUid ? hostColor : opposite(hostColor);


  if (!lobby) return <Navigate to={"/home"} />;

  // 1. Prepare the partial data based on your conditions

  // 2. Construct the single object
  // We cast 'as LobbyContextType' because we trust our logic above
  // matches the Type Guard requirements we defined.
  const contextValue = {
    playerColor, // Don't forget the base fields!
    lobby,
    isHost,
  };

  console.log({ lobbyContextValue: contextValue });
  return <LobbyContext value={contextValue}>{children}</LobbyContext>;
}
