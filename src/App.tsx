import { AuctionChessBoard } from "./components/Game";
import { Client } from "boardgame.io/react";
import "./styles/App.css";
import { AuctionChessGame } from "./game/auctionChess";
import { Local, SocketIO } from "boardgame.io/multiplayer";

const ClientA = Client({
  game: AuctionChessGame,
  board: AuctionChessBoard,
  multiplayer: SocketIO({ server: 'localhost:3001' }),
  numPlayers: 2,
});

const color = prompt("white or black");

export function App() {
  
  return (
    <>
      <div className="app">
        <ClientA playerID={color!} />
      </div>
    </>
  );
}

export default App;
