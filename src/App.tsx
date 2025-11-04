import BidPanel from "./components/BidPanel";
import { PseudoChessBoard, PseudoChessGame } from "./components/Game";
import { Client } from 'boardgame.io/react';
import "./styles/App.css"

const BoardGame = Client({ game: PseudoChessGame, board: PseudoChessBoard });

export function App() {
  return (
    <div className="app">
      <div className="board-container">
        <BoardGame />
      </div>
      <BidPanel />
    </div>
  )
}

export default App;
