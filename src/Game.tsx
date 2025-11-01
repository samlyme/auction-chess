import type { Game, Move, MoveMap } from "boardgame.io";
import { PseudoChess } from "./pseudoChess";
import { makeBoardFen, makeFen, parseFen } from "chessops/fen";
import { parseSquare, type NormalMove, type Setup } from "chessops";
import { INVALID_MOVE } from "boardgame.io/core";
import { Chessboard } from "react-chessboard";
import type { BoardProps } from "boardgame.io/dist/types/packages/react";

// At the top level, use react-chessboard's square type
// Since the game state can't include classes, we need use closures to access
// our chess logic.

export interface ChessState {
  fen: string;
}


const movePiece: Move<ChessState> = ({ G }, move: NormalMove) => {
  console.log("movePiece", {G, move});
  
  const setupRes = parseFen(G.fen);
  const setup: Setup = setupRes.unwrap();
  const chessLogic: PseudoChess = new PseudoChess(setup);

  if (!chessLogic.isLegal(move)) return INVALID_MOVE;

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
  return (
    <Chessboard options={{
      position: G.fen,
      onPieceDrop: ({sourceSquare, targetSquare}): boolean => {
        moves.movePiece!({from: parseSquare(sourceSquare), to: parseSquare(targetSquare!)})
        return true
      }
    }} />
  )
}