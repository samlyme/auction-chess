import { AuctionChessBoard } from "./components/Game";
import { Client } from "boardgame.io/react";
import "./styles/App.css";
import { AuctionChessGame } from "./game/auctionChess";
import { Local } from "boardgame.io/multiplayer";

const ClientA = Client({
  game: AuctionChessGame,
  board: AuctionChessBoard,
  multiplayer: Local(),
  numPlayers: 2,
});

export function App() {
  return (
    <>
      <div className="app">
        <ClientA playerID="white" />
      </div>
      <div className="app">
        <ClientA playerID="black" />
      </div>
    </>
  );
}

export default App;
