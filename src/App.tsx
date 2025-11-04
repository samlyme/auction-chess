import { PseudoChessBoard, PseudoChessGame } from "./Game";
import { Client } from 'boardgame.io/react';

const BoardGame = Client({ game: PseudoChessGame, board: PseudoChessBoard });

export function App() {
  return (
    <div className="board-container" style={{height: "90vmin", width:"90vmin"}}>
      <BoardGame />
    </div>
  )
}

export default App;
