// src/hooks/useChessMoves.ts
import { useState, useCallback } from "react";
import type { BoardPieces, BoardPosition, LegalMoves, Move, Piece } from "../schemas/types"; // Import your types

interface UseMovesReturn {
  selectedSquare: BoardPosition | null;
  handleSquareClick: (p: BoardPosition) => void;
}

function useMoves(
  board: BoardPieces | null,
  moves: LegalMoves | null,
  makeMove: (move: Move) => void
): UseMovesReturn {
  const [selectedSquare, setSelectedSquare] = useState<BoardPosition | null>(
    null
  );

  const handleSquareClick = useCallback(
    ({ row, col }: BoardPosition) => {
      console.log("Clicked sqaure: ", row, col);

      if (!board) return;
      if (!moves) return;
      
      const clickedSquare: Piece | null = board[row][col];

      if (selectedSquare) {
        if (selectedSquare.row == row && selectedSquare.col == col) {
          setSelectedSquare(null);
          return;
        }

        makeMove({
          start: selectedSquare,
          end: { row, col },
        });
        setSelectedSquare(null);
      } else {
        if (clickedSquare) setSelectedSquare({ row, col });
      }
    },
    [board, selectedSquare, makeMove]
  );

  return { selectedSquare, handleSquareClick };
}

export default useMoves;
