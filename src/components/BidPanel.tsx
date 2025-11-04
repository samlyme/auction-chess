import "../styles/BidPanel.css";

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
      <h1>
        ${balance} <em>{nextBalance}</em>
      </h1>
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

function BidMenu({ currentBid }: { currentBid: number }) {
  return (
    <div className="bid-menu item">
      <div className="left">
        <div className="item">
          <p>Current Bid</p>
          <div className="item">${currentBid}</div>
        </div>
        <div className="bid-fold">
          <div className="item">BID</div>
          <div className="item">FOLD</div>
        </div>
        <div className="item">MATCH</div>
      </div>
      <div className="right">
        <div className="increment-stack">
          <div className="item">+20</div>
          <div className="item">+10</div>
          <div className="item">Reset</div>
          <div className="item">-10</div>
          <div className="item">-20</div>
        </div>
      </div>
    </div>
  );
}
export default function BidPanel() {
  return (
    <div className="bid-panel">
      <TimeAndTitle time={"15:00"} username={"Player 1"} color={"white"} />

      <CurrentBalance balance={1000} nextBalance={750} />

      <BidInfo playerBid={250} oppBid={250} />

      <BidMenu currentBid={250} />

      <CurrentBalance balance={1000} nextBalance={750} />

      <TimeAndTitle time={"15:00"} username={"Player 1"} color={"white"} />
    </div>
  );
}
