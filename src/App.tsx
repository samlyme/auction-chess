import BidPanel from "./components/BidPanel";
import { PseudoChessBoard, PseudoChessGame } from "./components/Game";
import { Client } from 'boardgame.io/react';
import "./styles/App.css"

const BoardGame = Client({ game: PseudoChessGame, board: PseudoChessBoard });

export function App() {
  return (
    <div className="board-container" style={{height: "90vmin", width:"90vmin"}}>
      <BoardGame />
      <BidPanel />
    </div>
  )
}

export default App;
