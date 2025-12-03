import type { AuctionChessState, Bid, Color } from "shared";
import { opposite } from "chessops";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import "./BidPanel.css"

interface GameProps {
  gameState: AuctionChessState;
  playerColor: Color;
  hostUsername: string;
  guestUsername: string;
  onMakeBid: (bid: Bid) => void;
}

function TimeAndTitle({
  time,
  username,
  color,
}: {
  time: string;
  username: string;
  color: string;
}) {
  return (
    <div className="time-and-title">
      <div className="time item">
        <p>{time}</p>
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
          <div
            className="item"
            onClick={() => makeBid({ amount: currentBid })}
          >
            BID
          </div>
          <div className="item" onClick={() => makeBid({ fold: true })}>
            FOLD
          </div>
        </div>
        <div
          className="item"
          onClick={() =>
            setCurrentBid(Math.min(playerBalance, oppBalance))
          }
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
  const lastBid = bidStack.length >= 1 ? bidStack[bidStack.length - 1] : {amount: 0};
  const secondLastBid =
    bidStack.length >= 2 ? bidStack[bidStack.length - 2] : {amount: 0};

  // Extract bid amounts from the last two bids
  let prevPlayerBidAmount = 0;
  let prevOppBidAmount = 0;
  if (gameState.turn !== playerColor) {
    prevPlayerBidAmount = "amount" in lastBid ? lastBid.amount : 0;
    prevOppBidAmount = "amount" in secondLastBid ? secondLastBid.amount: 0;
  }
  else {
    prevOppBidAmount = "amount" in lastBid ? lastBid.amount : 0;
    prevPlayerBidAmount = "amount" in secondLastBid ? secondLastBid.amount: 0;
  }



  const [currentBid, setCurrentBid] = useState<number>(0);

  useEffect(() => {
    setCurrentBid(Math.max(prevPlayerBidAmount, prevOppBidAmount));
  }, [gameState]);

  const playerUsername =
    playerColor === "white" ? hostUsername : guestUsername;
  const opponentUsername =
    opponentColor === "white" ? hostUsername : guestUsername;

  return (
    <div className="bid-panel">
      <TimeAndTitle
        time={"15:00"}
        username={opponentUsername}
        color={opponentColor}
      />

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
        makeBid={onMakeBid}
      />

      <CurrentBalance
        balance={balance[playerColor] ?? 0}
        nextBalance={(balance[playerColor] ?? 0) - currentBid}
      />

      <TimeAndTitle time={"15:00"} username={playerUsername} color={playerColor} />
    </div>
  );
}
