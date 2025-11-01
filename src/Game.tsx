import type { Game, Move, MoveMap } from "boardgame.io";
import { PseudoChess } from "./pseudoChess";
import { makeBoardFen, makeFen, parseFen } from "chessops/fen";
import { parseSquare, type NormalMove, type Setup } from "chessops";
import { INVALID_MOVE } from "boardgame.io/core";
import { Chessboard, type SquareHandlerArgs } from "react-chessboard";
import type { BoardProps } from "boardgame.io/dist/types/packages/react";
import { useState } from "react";

// At the top level, use react-chessboard's square type
// Since the game state can't include classes, we need use closures to access
// our chess logic.

export interface ChessState {
  fen: string;
}


const movePiece: Move<ChessState> = ({ G }, move: NormalMove) => {
  const setupRes = parseFen(G.fen);
  const setup: Setup = setupRes.unwrap();
  const chessLogic: PseudoChess = new PseudoChess(setup);

  // TODO: Implement pseudomove isLegal
  // if (!chessLogic.isLegal(move)) return INVALID_MOVE;

  chessLogic.play(move);
  G.fen = makeFen(chessLogic.toSetup());
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
    movePiece: movePiece,
  },

  endIf: ({G, ctx}) => {
    const setupRes = parseFen(G.fen);
    const setup: Setup = setupRes.unwrap();
    const chessLogic: PseudoChess = new PseudoChess(setup);
    
    const outcome = chessLogic.outcome();
    if (outcome) return { winner: outcome.winner }
  }
};

export function PseudoChessBoard({ G, moves }: BoardProps) {
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
      moves.movePiece!(move);
    }
  }

  return (
    // TODO: fix animation
    <Chessboard options={{
      position: G.fen,
      onPieceDrop: ({sourceSquare, targetSquare}): boolean => {
        moves.movePiece!({from: parseSquare(sourceSquare), to: parseSquare(targetSquare!)})
        return true
      },
      onSquareClick,
    }} />
  )
}