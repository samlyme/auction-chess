import { Chessboard, type PieceDropHandlerArgs } from "react-chessboard";
import {
  Chess,
  parseSquare,
  SquareSet,
  type NormalMove,
  type Square,
} from "chessops";
import "./index.css";
import { useRef, useState } from "react";
import { makeFen } from "chessops/fen";

function* validMovesGenerator(
  allDests: Map<Square, SquareSet>
): Generator<NormalMove> {
  for (const [start, ends] of allDests.entries()) {
    for (const end of ends) {
      yield { from: start, to: end };
    }
  }
}

export function App() {
  const chessGameRef = useRef(Chess.default());
  const chessGame = chessGameRef.current;

  const [chessPosition, setChessPosition] = useState(
    makeFen(chessGame.toSetup())
  );

  function makeRandomMove() {
    const validMoves = validMovesGenerator(chessGame.allDests());

    let move: NormalMove | null = null;
    let count = 0;
    for (const newMove of validMoves) {
      count += 1;
      if (Math.random() * count < 1) {
        move = newMove;
      }
    }

    chessGame.play(move!);
    setChessPosition(makeFen(chessGame.toSetup()));
  }

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!targetSquare) return false;

    const move: NormalMove = {
      from: parseSquare(sourceSquare)!,
      to: parseSquare(targetSquare)!,
      // promotion: "queen"
    };

    const validMoves = validMovesGenerator(chessGame.allDests());

    if (
      !validMoves.some(
        (value: NormalMove) => value.from === move.from && value.to === move.to
      )
    ) {
      return false;
    }

    chessGame.play(move);

    setChessPosition(makeFen(chessGame.toSetup()));

    makeRandomMove();
    return true;
  }

  const chessboardOptions = {
    position: chessPosition,
    onPieceDrop,
    id: "play-vs-random",
  };

  return (
    <div className="app">
      <div className="game" style={{ width: "50%", margin: "auto" }}>
        <Chessboard options={chessboardOptions} />
      </div>
    </div>
  );
}

export default App;
