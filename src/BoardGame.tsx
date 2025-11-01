import { Client, type BoardProps } from "boardgame.io/react";
import { PseudoChessGame } from "./Game";
import { useEffect, useMemo, useState } from "react";
import { parseSquare, type Move, type NormalMove } from "chessops";
import {
  Chessboard,
  SquareHandlerArgs,
  type PieceDropHandlerArgs,
} from "react-chessboard";

interface ChessData {
  fen: string;
  setFen: (fen: string) => void;
  movePiece: (move: Move) => void;
  setMovePiece: React.Dispatch<React.SetStateAction<(move: Move) => void>>;
}

function chessBoardPortalFactory(
  setFen: (fen: string) => void,
  setMovePiece: React.Dispatch<React.SetStateAction<(move: Move) => void>>
) {
  // Returns a stable React component. We'll memoize the factory result in BoardGame.
  return function ChessBoardPortal({ G, moves }: BoardProps) {
    console.log("Render portal");

    useEffect(() => {
      // Mirror latest game state & move function to the outer component.
      setFen(G.fen);
      setMovePiece(() => moves.movePiece);
    }, [G.fen, moves.movePiece, setFen, setMovePiece]);

    return null;
  };
}

function ChessBoardDestination({
  movePiece,
  fen,
}: {
  movePiece: (_: Move) => void;
  fen: string;
}) {
  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!targetSquare) return false;

    const move: NormalMove = {
      from: parseSquare(sourceSquare)!,
      to: parseSquare(targetSquare)!,
    };

    movePiece(move);
    return true;
  }

  const [moveFrom, setMoveFrom] = useState("");

  function onSquareClick({ square, piece }: SquareHandlerArgs) {
    if (moveFrom == "" && piece) {
      setMoveFrom(square)
    }
    else if (square == moveFrom) setMoveFrom("");
    else {
      const move: NormalMove = {
        from: parseSquare(moveFrom)!,
        to: parseSquare(square)!
      }
      console.log("attemping click move", {moveFrom, square, move});
      setMoveFrom("")
      movePiece(move)
    }
  }

  return (
    <Chessboard
      options={{
        position: fen,
        onPieceDrop,
        onSquareClick,
      }}
    />
  );
}

function BoardGame() {
  const [fen, setFen] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [movePiece, setMovePiece] = useState<(move: Move) => void>(() => {
    return (_: Move) => {
      // Placeholder until the portal wires up the real move handler from boardgame.io
      // console.log("Uninitialized movePiece");
    };
  });

  // Memoize the board portal so it doesn't become a new component type each render.
  const BoardPortal = useMemo(
    () => chessBoardPortalFactory(setFen, setMovePiece),
    [setFen, setMovePiece]
  );

  // Memoize the Client so it is created only once per BoardPortal.
  const ClientComponent = useMemo(
    () =>
      Client({
        game: PseudoChessGame,
        board: BoardPortal,
      }),
    [BoardPortal]
  );

  return (
    <>
      <ChessBoardDestination movePiece={movePiece} fen={fen} />
      <ClientComponent />
    </>
  );
}

export default BoardGame;
