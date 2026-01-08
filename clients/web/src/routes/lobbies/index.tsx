import BidPanel from '@/components/game/BidPanel';
import { AuctionChessBoard } from '@/components/game/Board';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/lobbies/')({
  beforeLoad: ({ search }) => {
    return search;
  },
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div className="aspect-video border flex w-full justify-center overflow-auto bg-(--color-background) p-8 ">

      <div className="p-6 grid grid-cols-12 gap-4 opacity-50">
        <div className="col-span-3">
          <BidPanel/>
        </div>
        <div className="flex justify-center items-center col-span-6">
          <AuctionChessBoard 
          gameState={{
            chessState: {fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"},
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
              prev: null
            },
            turn: "white",
            phase: "bid"
          }}
          playerColor='white'
          hostUsername='spam'
          guestUsername='bob'
          onMakeMove={() => {}}
          onMakeBid={() => {}}
          />
        </div>
        <div className="col-span-3">
          <BidPanel/>
        </div>

      </div>
    </div>
  );
}
