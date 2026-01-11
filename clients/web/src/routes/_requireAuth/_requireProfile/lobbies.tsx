import BidPanel from '@/components/game/BidPanel';
import { AuctionChessBoard } from '@/components/game/Board';
import LobbyPanel from '@/components/game/LobbyPanel';
import useRealtime from '@/hooks/useRealtime';
import { getGame, timecheck } from '@/services/game';
import { getLobby } from '@/services/lobbies';
import { getProfile } from '@/services/profiles';
import { createFileRoute, Navigate, redirect } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { LobbyPayload, type AuctionChessState, type Color, type Profile } from 'shared';
import { useTimer } from 'react-timer-hook';
import type { useTimerResultType } from 'react-timer-hook/dist/types/src/useTimer';


const defaultGameState = {
  chessState: {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  },
  auctionState: {
    balance: {
      white: 100,
      black: 100,
    },
    bidHistory: [],
  },
  timeState: {
    time: {
      white: 5 * 60 * 1000,
      black: 5 * 60 * 1000,
    },
    prev: null,
  },
  turn: 'white',
  phase: 'bid',
} as AuctionChessState;

export const Route = createFileRoute('/_requireAuth/_requireProfile/lobbies')({
  loader: async ({ context }) => {
    const userId = context.auth.session.user.id;

    const resLobby = await getLobby();
    if (!resLobby.ok) throw Error('Failed to fetch lobby');
    const lobby = resLobby.value;
    if (!lobby) throw redirect({ to: "/home" });

    console.log({lobby});
    

    const oppId = userId === lobby.hostUid ? lobby.guestUid : lobby.hostUid;

    let opp: Profile | null = null;
    if (oppId) {
      const resOpp = await getProfile({ id: oppId });
      if (!resOpp.ok) throw Error("Failed to get opponent profile");
      opp = resOpp.value;
    }

    const resGame = await getGame();
    if (!resGame.ok) throw Error('Failed to fetch game');
    const game = resGame.value;
    console.log({game});
    
    
    return { lobby, game, opp };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const userId = Route.useRouteContext().auth.session.user.id;
  const userProfile = Route.useRouteContext().profile;

  const { lobby: initLobby, game: initGame, opp } = Route.useLoaderData();

  const [lobby, setLobby] = useState<LobbyPayload | null>(initLobby);
  const [game, setGameState] = useState<AuctionChessState | null>(initGame || defaultGameState);
  useRealtime(userId, initLobby.code, setLobby, setGameState)

  // Calculate these values before hooks, with fallbacks for when lobby is null
  const hostColor = lobby?.config.gameConfig.hostColor || 'white';
  const opposite = (color: Color) => color === "white" ? "black" : "white";
  const playerColor = lobby && userId === lobby.hostUid ? hostColor : opposite(hostColor);
  const gameStarted = lobby?.gameStarted || false;
  const phase = game?.phase || "bid";

  // All hooks must be called before any early returns
  const playerTimer = useTimer({
    autoStart: false,
    expiryTimestamp: new Date(Date.now() + (lobby?.config.gameConfig.initTime[playerColor] || 5 * 60 * 1000)),
    onExpire: async () => { await timecheck() }
  });
  const oppTimer = useTimer({
    autoStart: false,
    expiryTimestamp: new Date(Date.now() + (lobby?.config.gameConfig.initTime[opposite(playerColor)] || 5 * 60 * 1000)),
    onExpire: async () => { await timecheck() }
  })

  useEffect(() => {
    if (!lobby) return; // Guard inside effect is fine

    if (!lobby.gameStarted || !game) {
      console.log("set timers to default");
      // The game isn't started, so use the lobby's config for time.
      playerTimer.restart(new Date(Date.now() + lobby.config.gameConfig.initTime[playerColor]), false)
      oppTimer.restart(new Date(Date.now() + lobby.config.gameConfig.initTime[opposite(playerColor)]), false)
    }
    else {
      console.log("set timers");

      console.log({prev: game.timeState.prev});

      const offset = game.timeState.prev || Date.now()

      console.log("time set with offset", offset);

      playerTimer.restart(new Date(offset + game.timeState.time[playerColor]), false)
      oppTimer.restart(new Date(offset + game.timeState.time[opposite(playerColor)]), false)

      console.log("playerColor:", playerColor);
      console.log("game.timeState.time:", game.timeState.time);
      console.log("playerExpiry:", offset + game.timeState.time[playerColor]);
      console.log("oppExpiry:", offset + game.timeState.time[opposite(playerColor)]);
      console.log("Date.now():", Date.now());

      // NOTE: This is fragile. This assumes that a null prev means the game is started
      if (game.timeState.prev !== null) {
        if (game.turn === playerColor) playerTimer.start();
        else oppTimer.start();
      }
    }
  }, [game, lobby])

  const timers: Record<Color, useTimerResultType> =
    playerColor === "white"
    ? { white: playerTimer, black: oppTimer }
    : { white: oppTimer,    black: playerTimer };

  // NOW we can do the early return, after all hooks have been called
  if (!lobby) return <Navigate to={'/home'}/>;

  
  return (
    <div className="flex aspect-video w-full justify-center overflow-auto border bg-(--color-background) p-8">
      <div className="grid grid-cols-12 gap-4 p-16">
        <div className="col-span-3">
          <LobbyPanel isHost={userId === lobby.hostUid} lobby={lobby}/>
        </div>

        <div className={`${!gameStarted || phase !== "move" ? "opacity-50" : ""} col-span-6 flex items-center justify-center`}>
          <AuctionChessBoard
            gameState={game || defaultGameState}
            playerColor={playerColor}
          />
        </div>
        <div className={`${!gameStarted || phase !== "bid" ? "opacity-50" : ""} col-span-3`}>
          <BidPanel username={userProfile.username} oppUsername={opp?.username} playerColor={playerColor} gameState={game || defaultGameState} timers={timers}/>
        </div>
      </div>
    </div>
  );
}
