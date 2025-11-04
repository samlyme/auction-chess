// TODO: for multiplayer, think about browser to browser connections.
import type { Game, Move } from "boardgame.io";
import { PseudoChess } from "./pseudoChess";
import { makeSquare, parseSquare, type NormalMove } from "chessops";
import { INVALID_MOVE, TurnOrder } from "boardgame.io/core";
import {
  Chessboard,
  type PieceDropHandlerArgs,
  type PieceHandlerArgs,
  type SquareHandlerArgs,
} from "react-chessboard";
import type { BoardProps } from "boardgame.io/dist/types/packages/react";
import { useState } from "react";
import {
  availableCapture,
  availableMove,
  selectedSquare,
} from "./styles/BoardStyle";

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
    order: TurnOrder.CUSTOM(["white", "black"]),
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
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  console.log(moveFrom);

  const chessLogic = new PseudoChess(G.fen);

  const moveOptions = moveFrom
    ? chessLogic.legalDests(parseSquare(moveFrom)!)
    : [];
  const squareStyles: Record<string, React.CSSProperties> = {};
  if (moveFrom) {
    squareStyles[moveFrom] = selectedSquare;
  }
  for (const moveOption of moveOptions) {
    squareStyles[makeSquare(moveOption)] = chessLogic.get(moveOption)
      ? availableCapture
      : availableMove;
  }

  function onPieceDrag({ square }: PieceHandlerArgs): void {
    setMoveFrom(square);
  }

  function onPieceDrop({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs): boolean {
    if (!targetSquare) return false;
    const move = {
      from: parseSquare(sourceSquare)!,
      to: parseSquare(targetSquare)!,
    };
    if (chessLogic.isLegal(move)) {
      moves.movePiece!(move);
      return true;
    }

    setMoveFrom(null);
    return false;
  }

  function onSquareClick({ square, piece }: SquareHandlerArgs): void {
    if (moveFrom === null) {
      setMoveFrom(piece === null ? null : square);
      return;
    }

    if (moveFrom === square) {
      setMoveFrom(null);
      return;
    }

    const move = { from: parseSquare(moveFrom)!, to: parseSquare(square)! };
    if (chessLogic.isLegal(move)) {
      moves.movePiece!(move);
      setMoveFrom(null);
    } else {
      setMoveFrom(piece === null ? null : square);
    }
  }

  return (
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
