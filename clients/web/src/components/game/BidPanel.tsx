import type { AuctionChessState, Bid, Color } from "shared";
import { opposite } from "chessops";
import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useTimer } from "react-use-precision-timer";
import { timecheck } from "../../services/game";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GameProps {
  gameState: AuctionChessState;
  playerColor: Color;
  hostUsername: string;
  guestUsername: string;
  onMakeBid: (bid: Bid) => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const times = [];
  if (hours > 0) times.push(hours);
  times.push(minutes);
  times.push(seconds);
  return times.map((v) => v.toString().padStart(2, "0")).join(":");
}

function TimeAndTitle({
  time,
  countdown,
  username,
  color,
  isCurrentTurn,
}: {
  time: number;
  countdown: boolean;
  username: string;
  color: string;
  isCurrentTurn: boolean;
}) {
  const delay = 25; // ms
  const [timeState, setTimeState] = useState<number>(time);

  // Sync local time state with server time updates
  useEffect(() => {
    setTimeState(time);
  }, [time]);

  const updateTime = useCallback(() => setTimeState((v) => {
    // TODO: stop timer when possible.
    if (v <= 0) {
      timecheck();
    }
    return Math.max(v - delay, 0);
  }), []);

  // Only run timer when it's the current player's turn
  const timer = useTimer({ delay }, updateTime);

  useEffect(() => {
    if (countdown) {
      timer.start();
    } else {
      timer.stop();
    }
  }, [countdown, timer]);

  return (
    <div className={cn(
      "grid grid-cols-[1fr_3fr] transition-all duration-300",
      isCurrentTurn && "bg-primary rounded-lg p-1 shadow-[0_0_15px_rgba(74,144,226,0.6)]"
    )}>
      <Card className={cn("m-0.5", isCurrentTurn && "border-[#5aa0f2]")}>
        <CardContent className="p-2 text-center text-lg">
          {formatTime(timeState)}
        </CardContent>
      </Card>
      <Card className={cn("m-0.5", isCurrentTurn && "border-[#5aa0f2]")}>
        <CardContent className="p-2 text-center text-lg">
          {username} ({color})
        </CardContent>
      </Card>
    </div>
  );
}

function CurrentBalance({
  balance,
  nextBalance,
}: {
  balance: number;
  nextBalance: number;
}) {
  return (
    <Card className="m-0.5">
      <CardContent className="p-2 text-center">
        <h5 className="text-sm mb-2">Current Balance</h5>
        <h2 className="text-xl font-bold">
          ${balance} <em className="text-muted-foreground">${nextBalance}</em>
        </h2>
      </CardContent>
    </Card>
  );
}

function BidInfo({ playerBid, oppBid }: { playerBid: number; oppBid: number }) {
  return (
    <div className="flex gap-0.5">
      <Card className="flex-1 m-0.5">
        <CardContent className="p-4 text-center border border-border">
          <p className="text-sm mb-1">Your Bid</p>
          <h2 className="text-xl font-bold">${playerBid}</h2>
        </CardContent>
      </Card>
      <Card className="flex-1 m-0.5">
        <CardContent className="p-4 text-center border border-border">
          <p className="text-sm mb-1">Opp. Bid</p>
          <h2 className="text-xl font-bold">${oppBid}</h2>
        </CardContent>
      </Card>
    </div>
  );
}

function BidMenu({
  currentBid,
  prevBid,
  playerBalance,
  oppBalance,
  setCurrentBid,
  makeBid,
}: {
  prevBid: number;
  playerBalance: number;
  oppBalance: number;
  currentBid: number;
  setCurrentBid: Dispatch<SetStateAction<number>>;
  makeBid: (bid: Bid) => void;
}) {
  return (
    <Card className="m-0.5">
      <CardContent className="p-2">
        <div className="flex gap-0.5">
          <div className="flex-[2] space-y-0.5">
            <Card>
              <CardContent className="p-2 text-center">
                <p className="text-sm">Current Bid</p>
                <Card className="mt-1 bg-secondary">
                  <CardContent className="p-2 text-lg font-bold">
                    ${currentBid}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
            <div className="flex gap-0.5">
              <Button
                className="flex-1"
                onClick={() => makeBid({ amount: currentBid })}
              >
                BID
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => makeBid({ fold: true })}
              >
                FOLD
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setCurrentBid(Math.min(playerBalance, oppBalance))}
            >
              MAX
            </Button>
          </div>
          <div className="flex-1">
            <div className="h-full flex flex-col justify-between gap-0.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentBid(Math.min(currentBid + 20, playerBalance))
                }
              >
                +20
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentBid(Math.min(currentBid + 10, playerBalance))
                }
              >
                +10
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentBid(prevBid)}
              >
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentBid(Math.max(currentBid - 10, prevBid))}
              >
                -10
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentBid(Math.max(currentBid - 20, prevBid))}
              >
                -20
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BidPanel({
  gameState,
  playerColor,
  hostUsername,
  guestUsername,
  onMakeBid,
}: GameProps) {
  const { balance, bidHistory } = gameState.auctionState;
  const opponentColor = opposite(playerColor);

  // TODO: fix this jank
  const bidStack = bidHistory[bidHistory.length - 1] ?? [];
  const lastBid = bidStack.at(-1) ?? { amount: 0 };
  const secondLastBid = bidStack.at(-2) ?? { amount: 0 };

  // Extract bid amounts from the last two bids
  let prevPlayerBidAmount = 0;
  let prevOppBidAmount = 0;
  if (gameState.turn !== playerColor) {
    prevPlayerBidAmount = "amount" in lastBid ? lastBid.amount : 0;
    prevOppBidAmount = "amount" in secondLastBid ? secondLastBid.amount : 0;
  } else {
    prevOppBidAmount = "amount" in lastBid ? lastBid.amount : 0;
    prevPlayerBidAmount = "amount" in secondLastBid ? secondLastBid.amount : 0;
  }

  const [currentBid, setCurrentBid] = useState<number>(0);

  useEffect(() => {
    setCurrentBid(Math.max(prevPlayerBidAmount, prevOppBidAmount));
  }, [gameState]);

  const isPlayerTurn = gameState.turn === playerColor;
  const playerUsername = playerColor === "white" ? hostUsername : guestUsername;
  const opponentUsername =
    opponentColor === "white" ? hostUsername : guestUsername;

  return (
    <div className="w-[300px] min-w-[250px] shrink-0">
      <TimeAndTitle
        time={
          gameState.timeState.time[opponentColor] -
          (gameState.timeState.prev && gameState.turn === opponentColor
            ? Date.now() - gameState.timeState.prev
            : 0)
        }
        countdown={!gameState.outcome && gameState.timeState.prev !== null && !isPlayerTurn}
        username={opponentUsername}
        color={opponentColor}
        isCurrentTurn={!isPlayerTurn}
      />

      <Card className={cn(
        "border-2 transition-all duration-300",
        gameState.phase === "move" && "opacity-40 grayscale-50 pointer-events-none"
      )}>
        <CardContent className="p-2 space-y-0">
          <CurrentBalance
            balance={balance[opponentColor] ?? 0}
            nextBalance={(balance[opponentColor] ?? 0) - prevOppBidAmount}
          />

          <BidInfo playerBid={prevPlayerBidAmount} oppBid={prevOppBidAmount} />

          <BidMenu
            currentBid={currentBid}
            prevBid={Math.max(prevPlayerBidAmount, prevOppBidAmount)}
            playerBalance={balance[playerColor] ?? 0}
            oppBalance={balance[opponentColor] ?? 0}
            setCurrentBid={setCurrentBid}
            makeBid={gameState.phase === "move" ? () => {} : onMakeBid}
          />

          <CurrentBalance
            balance={balance[playerColor] ?? 0}
            nextBalance={(balance[playerColor] ?? 0) - currentBid}
          />
        </CardContent>
      </Card>

      <TimeAndTitle
        time={
          gameState.timeState.time[playerColor] -
          (gameState.timeState.prev && gameState.turn === playerColor
            ? Date.now() - gameState.timeState.prev
            : 0)
        }
        countdown={!gameState.outcome && gameState.timeState.prev !== null && isPlayerTurn}
        username={playerUsername}
        color={playerColor}
        isCurrentTurn={isPlayerTurn}
      />
    </div>
  );
}
