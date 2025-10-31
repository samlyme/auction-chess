import { Chessboard, type PieceDropHandlerArgs } from "react-chessboard";
import { Chess, parseSquare, SquareSet, type NormalMove, type Square } from "chessops";
import "./index.css";
import { useRef, useState } from "react";
import { makeFen } from "chessops/fen";


export function App() {

  const chessGameRef = useRef(Chess.default());
  const chessGame = chessGameRef.current;

  const [chessPosition, setChessPosition] = useState(makeFen(chessGame.toSetup()));

  function makeRandomMove() {
    const possibleMoves = chessGame.allDests();

    function* validMovesGenerator(): Generator<NormalMove> {
      for (const [start, ends] of possibleMoves.entries()) {
        for (const end of ends) {
          yield { from: start, to: end};
        }
      }
    }

    const validMoves = validMovesGenerator();
    
    let move: NormalMove | null = null;
    let count = 0
    for (const newMove of validMoves) {
      count += 1;
      if (Math.random() * count < 1) {
        move = newMove
      }
    }
    
    chessGame.play(move!)
    setChessPosition(makeFen(chessGame.toSetup()))
  }

  function onPieceDrop({sourceSquare, targetSquare}: PieceDropHandlerArgs) {
    if (!targetSquare) return false;

    try {
      chessGame.play({
        from: parseSquare(sourceSquare)!,
        to: parseSquare(targetSquare)!,
        // promotion: "queen"
      });

      setChessPosition(makeFen(chessGame.toSetup()))
      makeRandomMove()
      return true;
    }
    catch {
      return false;
    }
  }

  const chessboardOptions = {
    position: chessPosition,
    onPieceDrop,
    id: 'play-vs-random'
  };

  return (
    <div className="app">
      <div className="game" style={{width: "50%", margin: "auto"}}>
        <Chessboard options={chessboardOptions}/>
      </div>
    </div>
  );
}

export default App;
