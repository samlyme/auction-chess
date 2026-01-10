import BidPanel from '@/components/game/BidPanel';
import { AuctionChessBoard } from '@/components/game/Board';
import LobbyPanel from '@/components/game/LobbyPanel';
import { getGame } from '@/services/game';
import { getLobby } from '@/services/lobbies';
import { getProfile } from '@/services/profiles';
import { createFileRoute, redirect } from '@tanstack/react-router';
import type { AuctionChessState, Color, Profile } from 'shared';

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
    
    return { lobby, game, opp };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const userId = Route.useRouteContext().auth.session.user.id;
  const userProfile = Route.useRouteContext().profile;

  const { lobby, game, opp } = Route.useLoaderData();

  const hostColor = lobby.config.gameConfig.hostColor;

  const opposite = (color: Color) => color === "white" ? "black" : "white";
  const playerColor = userId === lobby.hostUid ? hostColor : opposite(hostColor);

  return (
    <div className="flex aspect-video w-full justify-center overflow-auto border bg-(--color-background) p-8">
      <div className="grid grid-cols-12 gap-4 p-16">
        <div className="col-span-3">
          <LobbyPanel isHost={true}/>
        </div>

        <div className="opacity-50 col-span-6 flex items-center justify-center">
          <AuctionChessBoard
            gameState={game || defaultGameState}
            playerColor={playerColor}
            onMakeMove={() => {}}
          />
        </div>
        <div className="opacity-50 col-span-3">
          <BidPanel username={userProfile.username} oppUsername={opp?.username}/>
        </div>
      </div>
    </div>
  );
}
