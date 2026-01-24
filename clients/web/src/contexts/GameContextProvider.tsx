import { useContext, useEffect } from "react";
import { LobbyContext } from "./Lobby";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
  useGameOptions,
  usePrevGameOptions,
  useTimecheckMutationOptions,
} from "@/queries/game";
import {
  useCountdownTimer,
  type UseCountdownTimerResult,
} from "@/hooks/useCountdownTimer";
import type { Color } from "shared/types/game";
import { opposite } from "@/utils";
import { GameContext } from "./Game";

export default function GameContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { lobby, playerColor } = useContext(LobbyContext);
  const { data: gameState } = useSuspenseQuery(useGameOptions());
  const { data: prevGameState } = useSuspenseQuery(usePrevGameOptions());

  const timecheckMutation = useMutation(useTimecheckMutationOptions());

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

    if (!lobby.gameStarted || !gameState) {
      // The game isn't started, so use the lobby's config for time.
      playerTimer.reset(initPlayerTime);
      oppTimer.reset(initOppTime);
    } else if (gameState && gameState.timeState) {
      const prev = gameState.timeState.prev || Date.now();
      const now = Date.now();
      const elapsed = now - prev;

      let playerTimeBalance = gameState.timeState.time[playerColor];
      let oppTimeBalance = gameState.timeState.time[opposite(playerColor)];

      if (gameState.turn === playerColor) playerTimeBalance -= elapsed;
      else oppTimeBalance -= elapsed;

      playerTimer.reset(playerTimeBalance);
      oppTimer.reset(oppTimeBalance);

      // NOTE: This is fragile. This assumes that a null prev means the game is started
      if (gameState.timeState.prev !== null) {
        if (gameState.turn === playerColor) playerTimer.start();
        else oppTimer.start();
      }
    }
  }, [gameState, lobby]);

  const timers: Record<Color, UseCountdownTimerResult> =
    playerColor === "white"
      ? { white: playerTimer, black: oppTimer }
      : { white: oppTimer, black: playerTimer };

  return (
    <GameContext
      value={{
        gameData: gameState ? { gameState, prevGameState } : null,
        timers: lobby.config.gameConfig.timeConfig.enabled ? timers : null,
      }}
    >
      {children}
    </GameContext>
  );
}
