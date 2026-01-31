import { useContext, useEffect, useState } from "react";
import { LobbyContext } from "./Lobby";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
  useGameOptions,
  useTimecheckMutationOptions,
} from "@/queries/game";
import {
  useCountdownTimer,
  type UseCountdownTimerResult,
} from "@/hooks/useCountdownTimer";
import type { Color } from "shared/types/game";
import { opposite } from "@/utils";
import { GameContext, type GameData } from "./Game";

export default function GameContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { lobby, playerColor } = useContext(LobbyContext);
  const { data: gameContext } = useSuspenseQuery(useGameOptions());

  const [gameData, setGameData] = useState<GameData | null>(null);
  useEffect(() => {
    if (gameContext === null) return;
    setGameData({
      gameState: gameContext.game,
      log: gameContext.log
    });
  }, [gameContext]);

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

    const gameUpdate = gameContext?.game;
    if (!lobby.gameStarted || !gameUpdate) {
      // The game isn't started, so use the lobby's config for time.
      playerTimer.reset(initPlayerTime);
      oppTimer.reset(initOppTime);
    } else if (gameUpdate && gameUpdate.timeState) {
      const prev = gameUpdate.timeState.prev || Date.now();
      const now = Date.now();
      const elapsed = now - prev;

      let playerTimeBalance = gameUpdate.timeState.time[playerColor];
      let oppTimeBalance = gameUpdate.timeState.time[opposite(playerColor)];

      if (gameUpdate.turn === playerColor) playerTimeBalance -= elapsed;
      else oppTimeBalance -= elapsed;

      playerTimer.reset(playerTimeBalance);
      oppTimer.reset(oppTimeBalance);

      // NOTE: This is fragile. This assumes that a null prev means the game is started
      if (gameUpdate.timeState.prev !== null) {
        if (gameUpdate.turn === playerColor) playerTimer.start();
        else oppTimer.start();
      }
    }
  }, [gameContext, lobby]);

  const timers: Record<Color, UseCountdownTimerResult> =
    playerColor === "white"
      ? { white: playerTimer, black: oppTimer }
      : { white: oppTimer, black: playerTimer };

  return (
    <GameContext
      value={{
        gameData,
        timers: lobby.config.gameConfig.timeConfig.enabled ? timers : null,
      }}
    >
      {children}
    </GameContext>
  );
}
