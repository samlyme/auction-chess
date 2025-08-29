// src/hooks/useChessMoves.ts
import { useState, useCallback } from "react";
import type { BoardPosition, Piece } from "../schemas/types"; // Import your types
import useGame from "./useGame";

interface UseMovesReturn {
  selectedSquare: BoardPosition | null;
  handleSquareClick: (p: BoardPosition) => void;
}

function useMoves(): UseMovesReturn {
  const { board, moves, makeMove, userColor } = useGame()
  const [selectedSquare, setSelectedSquare] = useState<BoardPosition | null>(
    null
  );

  const handleSquareClick = useCallback(
    ({ row, col }: BoardPosition) => {
      console.log("Clicked sqaure: ", row, col);

      if (!board || !moves) return;

      const piece: Piece | null = board[row][col]
      if (!selectedSquare && !piece) return
      if (!selectedSquare && piece && piece.color !== userColor) return

      // Base case, nothing is currently selected and clicked on own piece
      if (!selectedSquare && piece && piece.color === userColor) {
        setSelectedSquare({ row, col })
        return;
      }

      // Clicked on currently selected square
      if (selectedSquare && selectedSquare.row == row && selectedSquare.col == col) {
        setSelectedSquare(null);
        return;
      }

      // Something has been selected, and you clicked on another square.
      // This "tries" to make a move. If move is legal, a request is made.
      // Either case, sets the selected back to null.
      if (selectedSquare){
        const legalMoves: BoardPosition[] = moves[selectedSquare.row][selectedSquare.col]
        if (legalMoves.some((elem: BoardPosition) => elem.row === row && elem.col === col)) {
          makeMove({
            start: selectedSquare,
            end: { row, col },
          });
        }
        setSelectedSquare(null);
      }
    },
    [board, selectedSquare, makeMove]
  );

  return { selectedSquare, handleSquareClick };
}

export default useMoves;
