import { useState, type FormEvent } from "react";
import useGame from "../hooks/useGame";
import type { Bid, Color, UserProfile } from "../schemas/types";
import useServerUpdates from "../hooks/useServerUpdates";

function Menu() {
  const { lobby } = useServerUpdates();
  const { userColor, game } = useGame();

  if (!game || !userColor || !lobby) return <div>Loading</div>;

  const opponentColor = userColor == "w" ? "b" : "w";
  const turn = game.phase == "bid" ? game.bid_turn : game.turn;

  const userProfile: UserProfile =
    userColor == "w" ? game.players.w : game.players.b;
  const opponentProfile: UserProfile =
    userColor == "w" ? game.players.b : game.players.w;

  const userBalance: number =
    userColor == "w" ? game.balances.w : game.balances.b;
  const opponentBalance: number =
    userColor == "w" ? game.balances.b : game.balances.w;
  return (
    <div className="menu">
      <div className={turn === opponentColor ? "highlight" : ""}>
        {opponentProfile ? (
          <PlayerProfile
            username={opponentProfile.username}
            color={opponentColor}
            balance={opponentBalance}
          />
        ) : (
          <div>disconnected</div>
        )}
      </div>

      <BiddingMenu />

      <div className={turn === userColor ? "highlight" : ""}>
        <PlayerProfile
          username={userProfile.username}
          color={userColor}
          balance={userBalance}
        />
      </div>
    </div>
  );
}

function PlayerProfile({
  username,
  color,
  balance,
}: {
  username: string;
  color: Color;
  balance: number;
}) {
  return (
    <div className="player-profile">
      <h2>
        {username} <i>({color == "w" ? "white" : "black"})</i>
      </h2>

      <h1>${balance}</h1>
    </div>
  );
}

function BiddingMenu() {
  const { makeBid, userColor, game } = useGame();
  const [bid, setBid] = useState<Bid>({ amount: 0, fold: false });

  if (!game) return <div>Loading</div>;


  const userBalance = userColor == "w" ? game.balances.w : game.balances.b;
  const opponentBalance = userColor == "w" ? game.balances.b : game.balances.w;
  const bidStack =
    game.auction_data.bid_history[game.auction_data.bid_history.length - 1];

  // setBid(bidStack[bidStack.length - 1] || {amount: 0, fold: false})
  
  let userLastBidAmount = 0;
  let opponentLastBidAmount = 0;
  if (bidStack.length >= 1) {
    if (game.bid_turn == userColor) {
      opponentLastBidAmount = bidStack[bidStack.length - 1].amount;
    } else {
      userLastBidAmount = bidStack[bidStack.length - 1].amount;
    }
  }

  if (bidStack.length >= 2) {
    if (game.bid_turn == userColor) {
      userLastBidAmount = bidStack[bidStack.length - 2].amount;
    } else {
      opponentLastBidAmount = bidStack[bidStack.length - 2].amount;
    }
  }

  const handleIncrement = (amount: number) => {
    setBid((prev) => {
      if (prev.amount + amount > userBalance) {
        return { amount: userBalance, fold: false };
      }
      return { amount: prev.amount + amount, fold: false };
    });
  };

  const handleReset = () => {
    setBid({ amount: opponentLastBidAmount, fold: false });
  };
  const handleAllIn = () => {
    if (opponentLastBidAmount == opponentBalance) {
      // TODO: fix this unsafe state.
      setBid({ amount: opponentLastBidAmount + 1, fold: false });
    } else {
      setBid({
        amount: userBalance < opponentBalance ? userBalance : opponentBalance,
        fold: false,
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleReset();
    makeBid(bid);
  };

  return (
    <form
      className={`bidding-menu ${game.phase === "move" ? "lowlight" : ""}`}
      onSubmit={handleSubmit}
    >
      <h3>Opponent bid: ${opponentLastBidAmount}</h3>
      <h3>Your bid: ${userLastBidAmount}</h3>

      <label>
        <h4>New bid: ${bid.amount}</h4>
        <input
          type="number"
          min="0"
          value={bid.amount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const val = parseInt(e.target.value, 10);
            setBid({ amount: isNaN(val) ? 0 : val, fold: false });
          }}
          placeholder="Raise bid"
        />
      </label>

      {/* TODO: Implement button disable for invalid bid options. */}
      <div>
        <button type="button" onClick={() => handleIncrement(-10)}>
          -10
        </button>
        <button type="button" onClick={() => handleReset()}>
          r
        </button>
        <button type="button" onClick={() => handleIncrement(10)}>
          +10
        </button>
        <button type="button" onClick={() => handleAllIn()}>
          ALL IN!!!
        </button>
      </div>

      <div>
        <button type="submit">Bid</button>
        <button
          type="button"
          onClick={() => {
            makeBid({ amount: 0, fold: true });
            setBid({ amount: 0, fold: false });
          }}
        >
          Fold
        </button>
      </div>
    </form>
  );
}

export default Menu;
