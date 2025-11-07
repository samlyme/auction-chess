import type { AuctionChessState, Bid } from "@/game/auctionChess";
import "../styles/BidPanel.css";
import { opposite, type Color } from "chessops";
import type { BoardProps } from "boardgame.io/dist/types/packages/react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

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
  playerID,
}: {
  playerID: Color;
  prevBid: number;
  playerBalance: number;
  oppBalance: number
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
            onClick={() =>
              makeBid({ amount: currentBid, fold: false, from: playerID })
            }
          >
            BID
          </div>
          <div
            className="item"
            onClick={() => makeBid({ amount: 0, fold: true, from: playerID })}
          >
            FOLD
          </div>
        </div>
        <div className="item" onClick={() => setCurrentBid(Math.min(playerBalance, oppBalance))}>MAX</div>
      </div>
      <div className="right">
        <div className="increment-stack">
          <div className="item" onClick={() => setCurrentBid(Math.min(currentBid + 20, playerBalance))}>
            +20
          </div>
          <div className="item" onClick={() => setCurrentBid(Math.min(currentBid + 10, playerBalance))}>
            +10
          </div>
          {/* TODO: make reset go to min raise */}
          <div className="item" onClick={() => setCurrentBid(prevBid)}>
            Reset
          </div>
          <div className="item" onClick={() => setCurrentBid(Math.max(currentBid - 10, prevBid))}>
            -10
          </div>
          <div className="item" onClick={() => setCurrentBid(Math.max(currentBid - 20, prevBid))}>
            -20
          </div>
        </div>
      </div>
    </div>
  );
}
export default function BidPanel({
  G,
  ctx,
  moves,
  playerID,
  isActive,
}: BoardProps<AuctionChessState>) {
  const {balance, bidHistory} = G.auctionState;

  const bidStack: Bid[] = bidHistory[bidHistory.length-1]!;
  const lastBid = bidStack.length >= 1 ? bidStack[bidStack.length-1] : null;
  const secondLastBid = bidStack.length >= 2 ? bidStack[bidStack.length-2] : null;

  let prevPlayerBidAmount = 0;
  let prevOppBidAmount = 0
  if (lastBid) {
    if (lastBid.from === playerID) {
      prevPlayerBidAmount = lastBid.amount
    }
    else {
      prevOppBidAmount = lastBid.amount
    }
  }
  if (secondLastBid) {
    if (secondLastBid.from === playerID) {
      prevPlayerBidAmount = secondLastBid.amount
    }
    else {
      prevOppBidAmount = secondLastBid.amount
    }
  }

  const [currentBid, setCurrentBid] = useState<number>(0);

  useEffect(() => {
    setCurrentBid(Math.max(prevPlayerBidAmount, prevOppBidAmount))
  },[G])

  return (
    <div className="bid-panel">
      <TimeAndTitle
        time={"15:00"}
        username={"Player 2"}
        color={opposite(playerID as Color)}
      />

      <CurrentBalance
        balance={balance[opposite(playerID as Color)]}
        nextBalance={balance[opposite(playerID as Color)] - prevOppBidAmount}
      />

      <BidInfo playerBid={prevPlayerBidAmount} oppBid={prevOppBidAmount} />

      <BidMenu
        currentBid={currentBid}
        prevBid={Math.max(prevPlayerBidAmount, prevOppBidAmount)}
        playerBalance={balance[playerID as Color]}
        oppBalance={balance[opposite(playerID as Color)]}
        setCurrentBid={setCurrentBid}
        makeBid={moves.makeBid!}
        playerID={playerID as Color}        
        />

      <CurrentBalance
        balance={balance[playerID as Color]}
        nextBalance={balance[playerID as Color] - currentBid}
      />

      <TimeAndTitle
        time={"15:00"}
        username={"Player 1"}
        color={playerID as Color}
      />
    </div>
  );
}
