import { useState, type FormEvent } from "react";
import { useAuthContext } from "../contexts/Auth";
import { useServerUpdatesContext } from "../contexts/ServerUpdates";
import useGame from "../hooks/useGame";
import type { Color, UserProfile } from "../schemas/types";

function Menu() {
  const { lobby } = useServerUpdatesContext();
  const { user } = useAuthContext();
  const { userColor, opponentColor, userBalance, opponentBalance, turn } =
    useGame();

  if (!lobby || !user) return <div>Loading</div>;

  const opponentProfile: UserProfile | null =
    userColor == "w" ? lobby.guest : lobby.host;

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
          username={user.username}
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

      <h4>Balance:</h4>
      <h1>${balance}</h1>
    </div>
  );
}

function BiddingMenu() {
    const { prevBid, phase, userBalance, makeBid } = useGame()
    const [raiseAmount, setNewRaise] = useState<number>(1)

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        makeBid(prevBid + raiseAmount)
        setNewRaise(1)
    };

    const handleIncrement = (amount: number) => {
        setNewRaise((prev) => {
            if (prevBid + amount > userBalance) return userBalance - prevBid
            return prev + amount
        });
    }
    
  return (
    <form className={`bidding-menu ${phase === "move" ? "lowlight" : ""}`} onSubmit={handleSubmit}>
      <h3>Last bid: ${prevBid}</h3>

      <label>
        <h4>New bid: ${raiseAmount}</h4>
        <input
          type="number"
          min="0"
          value={raiseAmount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const val = parseInt(e.target.value, 10);
            setNewRaise(isNaN(val) ? 1 : val);
          }}
          placeholder="Raise bid"
        />
      </label>

      <div>
        <button type="button" onClick={() => handleIncrement(1)}>
          +1
        </button>
        <button type="button" onClick={() => handleIncrement(5)}>
          +5
        </button>
        <button type="button" onClick={() => handleIncrement(20)}>
          +20
        </button>
        <button type="button" onClick={() => handleIncrement(9999999)}>
          ALL IN!!!
        </button>
      </div>

      <div>
        <button type="submit">Bid</button>
        <button type="button" onClick={() => {
            makeBid(-1)
            setNewRaise(0)
        }}>
          Fold
        </button>
      </div>
    </form>
  );
}

export default Menu;
