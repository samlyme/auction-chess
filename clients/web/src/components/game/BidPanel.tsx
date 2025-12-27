import type { AuctionChessState, Bid, Color } from "shared";
import { opposite } from "chessops";
import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import "./BidPanel.css";
import { useTimer } from "react-use-precision-timer";

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
  const delay = 100; // ms
  const [timeState, setTimeState] = useState<number>(time);

  // Sync local time state with server time updates
  useEffect(() => {
    setTimeState(time);
  }, [time]);

  const updateTime = useCallback(() => setTimeState((v) => v - delay), []);

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
    <div className={`time-and-title ${isCurrentTurn ? "current-turn" : ""}`}>
      <div className="time item">
        <p>{formatTime(timeState)}</p>
      </div>
      <div className="title item">
        <p>
          {username} ({color})
        </p>
      </div>
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
    <div className="current-balance item">
      <h5>Current Balance</h5>
      <h2>
        ${balance} <em>{nextBalance}</em>
      </h2>
    </div>
  );
}

function BidInfo({ playerBid, oppBid }: { playerBid: number; oppBid: number }) {
  return (
    <div className="bid-info">
      <div className="item">
        <p>Your Bid</p>
        <h2>${playerBid}</h2>
      </div>
      <div className="item">
        <p>Opp. Bid</p>
        <h2>${oppBid}</h2>
      </div>
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
    <div className="bid-menu item">
      <div className="left">
        <div className="item">
          <p>Current Bid</p>
          <div className="item">${currentBid}</div>
        </div>
        <div className="bid-fold">
          <div className="item" onClick={() => makeBid({ amount: currentBid })}>
            BID
          </div>
          <div className="item" onClick={() => makeBid({ fold: true })}>
            FOLD
          </div>
        </div>
        <div
          className="item"
          onClick={() => setCurrentBid(Math.min(playerBalance, oppBalance))}
        >
          MAX
        </div>
      </div>
      <div className="right">
        <div className="increment-stack">
          <div
            className="item"
            onClick={() =>
              setCurrentBid(Math.min(currentBid + 20, playerBalance))
            }
          >
            +20
          </div>
          <div
            className="item"
            onClick={() =>
              setCurrentBid(Math.min(currentBid + 10, playerBalance))
            }
          >
            +10
          </div>
          {/* TODO: make reset go to min raise */}
          <div className="item" onClick={() => setCurrentBid(prevBid)}>
            Reset
          </div>
          <div
            className="item"
            onClick={() => setCurrentBid(Math.max(currentBid - 10, prevBid))}
          >
            -10
          </div>
          <div
            className="item"
            onClick={() => setCurrentBid(Math.max(currentBid - 20, prevBid))}
          >
            -20
          </div>
        </div>
      </div>
    </div>
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
  const bidStack: Bid[] = bidHistory[bidHistory.length - 1] ?? [];
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
    <div>
      <TimeAndTitle
        time={
          gameState.timeState.time[opponentColor] -
          (gameState.timeState.prev && gameState.turn === opponentColor
            ? Date.now() - gameState.timeState.prev
            : 0)
        }
        countdown={gameState.timeState.prev !== null && !isPlayerTurn}
        username={opponentUsername}
        color={opponentColor}
        isCurrentTurn={!isPlayerTurn}
      />

      <div
        className={`bid-panel ${gameState.phase === "move" ? "grayed-out" : ""}`}
      >
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
      </div>

      <TimeAndTitle
        time={
          gameState.timeState.time[playerColor] -
          (gameState.timeState.prev && gameState.turn === playerColor
            ? Date.now() - gameState.timeState.prev
            : 0)
        }
        countdown={gameState.timeState.prev !== null && isPlayerTurn}
        username={playerUsername}
        color={playerColor}
        isCurrentTurn={isPlayerTurn}
      />
    </div>
  );
}
