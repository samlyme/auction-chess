import type { Game, Move, MoveMap } from "boardgame.io";
import { PseudoChess } from "./pseudoChess";
import { makeSquare, parseSquare, type NormalMove } from "chessops";
import { INVALID_MOVE } from "boardgame.io/core";
import {
  Chessboard,
  type PieceDropHandlerArgs,
  type PieceHandlerArgs,
  type SquareHandlerArgs,
} from "react-chessboard";
import type { BoardProps } from "boardgame.io/dist/types/packages/react";
import { useState } from "react";

export interface ChessState {
  fen: string;
}

const movePiece: Move<ChessState> = ({ G }, move: NormalMove) => {
  // Consider a refactor. Recreating the class per move COULD be a bottleneck.
  const chessLogic = new PseudoChess(G.fen);
  if (!chessLogic.movePiece(move)) return INVALID_MOVE;
  G.fen = chessLogic.toFen();
};

export const PseudoChessGame: Game<ChessState> = {
  setup: () => ({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  }),

  turn: {
    minMoves: 1,
    maxMoves: 1,
  },

  moves: {
    movePiece,
  },

  endIf: ({ G, ctx }) => {
    const chessLogic: PseudoChess = new PseudoChess(G.fen);

    const outcome = chessLogic.outcome();
    if (outcome.winner) return outcome;
  },
};

export function PseudoChessBoard({ G, moves }: BoardProps) {
  // TODO: current code setup creates a lot of invalid moves. maybe add checks
  // to onPieceDrop and onSquareClick functions. 
  const [moveFrom, setMoveFrom] = useState<string | null>(null);

  const chessLogic = new PseudoChess(G.fen);

  const moveOptions = moveFrom
    ? chessLogic.legalDests(parseSquare(moveFrom)!)
    : [];
  const squareStyles: Record<string, React.CSSProperties> = {};
  if (moveFrom) {
    squareStyles[moveFrom] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
  }
  for (const moveOption of moveOptions) {
    squareStyles[makeSquare(moveOption)] = chessLogic.get(moveOption)
      ? {
          background:
            "radial-gradient(circle, rgba(0,0,0,.2) 85%, transparent 85%)",
          borderRadius: "50%",
        }
      : {
          background:
            "radial-gradient(circle, rgba(0,0,0,.2) 25%, transparent 25%)",
          borderRadius: "50%",
        };
  }

  function onPieceDrag({ square }: PieceHandlerArgs) {
    setMoveFrom(square);
  }

  function onPieceDrop({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs): boolean {
    if (!targetSquare) return false;

    moves.movePiece!({
      from: parseSquare(sourceSquare),
      to: parseSquare(targetSquare),
    });
    setMoveFrom(null);
    return true;
  }

  function onSquareClick({ square, piece }: SquareHandlerArgs): void {
    console.log("moveFrom", moveFrom);

    if (moveFrom !== null) {
      if (square !== moveFrom) {
        moves.movePiece!({
          from: parseSquare(moveFrom),
          to: parseSquare(square),
        });
      }
      setMoveFrom(null);
    } else if (piece !== null) {
      setMoveFrom(square);
    } else {
      setMoveFrom(null);
    }
  }

  return (
    // TODO: fix animation
    <Chessboard
      options={{
        position: G.fen,
        onPieceDrag,
        onPieceDrop,
        onSquareClick,
        squareStyles,
      }}
    />
  );
}
