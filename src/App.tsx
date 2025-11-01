import { Chessboard, type PieceDropHandlerArgs, type SquareHandlerArgs } from "react-chessboard";
import {
  Chess,
  makeSquare,
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

  const [optionSquares, setOptionSquares] = useState({})

  const [moveFrom, setMoveFrom] = useState('');


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

    const validMove = validMoves.find(
      (value: NormalMove) => value.from === move.from && value.to == move.to
    );

    if (!validMove) return false;

    // always promo to queen
    if (validMove.promotion) validMove.promotion = "queen"
    chessGame.play(validMove);
    setChessPosition(makeFen(chessGame.toSetup()));
    makeRandomMove();
    return true;
  }

  function getMoveOptions(square: string): boolean {
    const moves: SquareSet | undefined = chessGame.allDests().get(parseSquare(square)!)

    if (!moves) {
      setOptionSquares({});
      return false;
    }

    const newSquares: Record<string, React.CSSProperties> = {};

    for (const move of moves) {
      newSquares[makeSquare(move)] = {
        background: 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      }
    }

    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    }

    setOptionSquares(newSquares);

    return true;
  }

  function onSquareClick({square, piece}: SquareHandlerArgs): void {
    if (!moveFrom && piece) {
      const hasMoveOptions = getMoveOptions(square);

      if (hasMoveOptions) setMoveFrom(square);

      return;
    }

    const parsedSquare = parseSquare(square)!;

    const validMoves = [...validMovesGenerator(chessGame.allDests())];
    
    if (!validMoves.find((value) => value.to === parsedSquare)) {
      const hasMoveOptions = getMoveOptions(square);

      setMoveFrom(hasMoveOptions ? square : "");
      return;
    }

    const move: NormalMove = {
      from: parseSquare(moveFrom)!,
      to: parseSquare(square)!,
    }

    const validMove = validMoves.find(
      (value: NormalMove) => value.from === move.from && value.to == move.to
    );

    if (!validMove) return;

    // always promo to queen
    if (validMove.promotion) validMove.promotion = "queen";
    chessGame.play(validMove);
    setOptionSquares({})
    setChessPosition(makeFen(chessGame.toSetup()));
    makeRandomMove();
  }

  const chessboardOptions = {
    position: chessPosition,
    onPieceDrop,
    onSquareClick,
    squareStyles: optionSquares,
    id: "play-vs-random",
  };

  // return (
  //   <div className="app">
  //     <div className="game" style={{ width: "50%", margin: "auto" }}>
  //       <Chessboard options={chessboardOptions} />
  //     </div>

  //     <div className="boardgameio">
      
  //     </div>
  //   </div>
  // );
}

export default App;
