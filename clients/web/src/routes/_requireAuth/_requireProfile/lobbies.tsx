import BidPanel from '@/components/game/BidPanel';
import { AuctionChessBoard } from '@/components/game/Board';
import LobbyPanel from '@/components/game/LobbyPanel';
import {
  useCountdownTimer,
  type UseCountdownTimerResult,
} from '@/hooks/useCountdownTimer';
import useRealtime from '@/hooks/useRealtime';
import { useTimecheck, useGame } from '@/hooks/queries/game';
import { useLobby } from '@/hooks/queries/lobbies';
import { getLobby } from '@/services/lobbies';
import { getProfile } from '@/services/profiles';
import { createFileRoute, Navigate, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';
import { type AuctionChessState, type Color, type Profile } from 'shared';

const defaultGameState = {
  chessState: {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  },
  auctionState: {
    balance: {
      white: 0,
      black: 0,
    },
    bidHistory: [],
  },
  timeState: {
    time: {
      white: 0,
      black: 0,
    },
    prev: null,
  },
  turn: 'white',
  phase: 'bid',
} as AuctionChessState;

export const Route = createFileRoute('/_requireAuth/_requireProfile/lobbies')({
  loader: async ({ context }) => {
    const userId = context.auth.session.user.id;

    const lobby = await getLobby();
    if (!lobby) throw redirect({ to: '/home' });

    const oppId = userId === lobby.hostUid ? lobby.guestUid : lobby.hostUid;

    const oppProfile: Profile | null = oppId
      ? await getProfile({ id: oppId })
      : null;

    return { lobby, oppProfile };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const userId = Route.useRouteContext().auth.session.user.id;
  const userProfile = Route.useRouteContext().profile;

  const { lobby: initLobby, oppProfile: initOppProfile } =
    Route.useLoaderData();

  // Use TanStack Query for real-time data instead of manual state management
  const { data: lobby } = useLobby();
  const { data: game } = useGame();
  const timecheckMutation = useTimecheck();

  // Bind the lobby and game to the real time updates.
  useRealtime(userId, initLobby.code);

  // Calculate these values before hooks, with fallbacks for when lobby is null
  const hostColor = lobby?.config.gameConfig.hostColor || 'white';
  const opposite = (color: Color) => (color === 'white' ? 'black' : 'white');
  const playerColor =
    lobby && userId === lobby.hostUid ? hostColor : opposite(hostColor);
  const gameStarted = lobby?.gameStarted || false;
  const phase = game?.phase || 'bid';

  // All hooks must be called before any early returns
  const playerTimer = useCountdownTimer({
    durationMs: lobby?.config.gameConfig.initTime[playerColor] || 0,
    onExpire: async () => {
      await timecheckMutation.mutateAsync();
    },
  });
  const oppTimer = useCountdownTimer({
    durationMs: lobby?.config.gameConfig.initTime[opposite(playerColor)] || 0,
    onExpire: async () => {
      await timecheckMutation.mutateAsync();
    },
  });

  // set the timers.
  useEffect(() => {
    if (!lobby) return;

    if (!lobby.gameStarted || !game) {
      // The game isn't started, so use the lobby's config for time.
      playerTimer.reset(lobby.config.gameConfig.initTime[playerColor]);
      oppTimer.reset(lobby.config.gameConfig.initTime[opposite(playerColor)]);
    } else if (game) {
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
    playerColor === 'white'
      ? { white: playerTimer, black: oppTimer }
      : { white: oppTimer, black: playerTimer };

  // NOW we can do the early return, after all hooks have been called
  if (!lobby) return <Navigate to={'/home'} />;

  return (
    <div className="flex aspect-video w-full justify-center overflow-auto border bg-(--color-background) p-8">
      <div className="grid grid-cols-12 gap-4 p-16">
        <div className="col-span-3">
          <LobbyPanel isHost={userId === lobby.hostUid} lobby={lobby} />
        </div>

        <div
          className={`${!gameStarted || phase !== 'move' ? 'opacity-50' : ''} col-span-6 flex items-center justify-center`}
        >
          <AuctionChessBoard
            gameState={game || defaultGameState}
            playerColor={playerColor}
          />
        </div>
        <div
          className={`${!gameStarted || phase !== 'bid' ? 'opacity-50' : ''} col-span-3`}
        >
          <BidPanel
            username={userProfile.username}
            oppUsername={initOppProfile?.username}
            playerColor={playerColor}
            gameState={game || defaultGameState}
            timers={timers}
          />
        </div>
      </div>
    </div>
  );
}
