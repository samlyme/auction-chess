import BidPanel from '@/components/game/BidPanel';
import { AuctionChessBoard } from '@/components/game/Board';
import LobbyPanel from '@/components/game/LobbyPanel';
import useRealtime from '@/hooks/useRealtime';
import { getGame } from '@/services/game';
import { getLobby } from '@/services/lobbies';
import { getProfile } from '@/services/profiles';
import { createFileRoute, Navigate, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { LobbyPayload, type AuctionChessState, type Color, type Profile } from 'shared';

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
  const [game, setGameState] = useState<AuctionChessState | null>(initGame);
  useRealtime(userId, initLobby.code, setLobby, setGameState)

  if (!lobby) return <Navigate to={'/home'}/>; // only happens when lobby is deleted or user left lobby

  const hostColor = lobby.config.gameConfig.hostColor;

  const opposite = (color: Color) => color === "white" ? "black" : "white";
  const playerColor = userId === lobby.hostUid ? hostColor : opposite(hostColor);

  const gameStarted = lobby.gameStarted;

  const phase = game?.phase || "bid";

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
            onMakeMove={() => {}}
          />
        </div>
        <div className={`${!gameStarted || phase !== "bid" ? "opacity-50" : ""} col-span-3`}>
          <BidPanel username={userProfile.username} oppUsername={opp?.username} playerColor={playerColor} gameState={game || defaultGameState} />
        </div>
      </div>
    </div>
  );
}
