// src/hooks/useChessMoves.ts
import { useState, useCallback } from "react";
import type { Game, BoardPosition, Move, Piece } from "../lib/types"; // Import your types

interface UseMovesReturn {
  selectedSquare: BoardPosition | null;
  handleSquareClick: (p: BoardPosition) => void;
}

function useMoves(
  game: Game | undefined,
  makeMove: (move: Move) => void
): UseMovesReturn {
  const [selectedSquare, setSelectedSquare] = useState<BoardPosition | null>(
    null
  );

  const handleSquareClick = useCallback(
    ({ row, col }: BoardPosition) => {
      console.log("Clicked sqaure: ", row, col);

      if (!game || !game.board) return;
      const clickedSquare: Piece | null = game.board[row][col];

      if (selectedSquare) {
        if (selectedSquare.row == row && selectedSquare.col == col) {
          setSelectedSquare(null);
          return;
        }
        // TODO: Do turn validation here
        if (clickedSquare) {
          setSelectedSquare({ row, col });
          return;
        }
        // already had something selected, and clicked on empty square
        // TODO: Do move legality validation here
        makeMove({
          start: selectedSquare,
          end: { row, col },
        });
        setSelectedSquare(null);
      } else {
        if (clickedSquare) setSelectedSquare({ row, col });
      }
    },
    [game, selectedSquare, makeMove]
  );

  return { selectedSquare, handleSquareClick };
}

export default useMoves;
