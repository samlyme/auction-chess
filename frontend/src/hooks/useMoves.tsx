// src/hooks/useChessMoves.ts
import { useState, useCallback } from "react";
import type { BoardPosition } from "../schemas/types"; // Import your types
import useGame from "./useGame";

interface UseMovesReturn {
  selectedSquare: BoardPosition | null;
  handleSquareClick: (p: BoardPosition) => void;
}

function useMoves(): UseMovesReturn {
  const { board, moves, makeMove } = useGame()
  const [selectedSquare, setSelectedSquare] = useState<BoardPosition | null>(
    null
  );

  const handleSquareClick = useCallback(
    ({ row, col }: BoardPosition) => {
      console.log("Clicked sqaure: ", row, col);

      if (!board || !moves) return;

      if (!selectedSquare && board[row][col]) {}

      if (selectedSquare) {
        if (selectedSquare.row == row && selectedSquare.col == col) {
          setSelectedSquare(null);
          return;
        }

        const legalMoves: BoardPosition[] = moves[selectedSquare.row][selectedSquare.col]
        if (legalMoves.some((elem: BoardPosition) => elem.row === row && elem.col === col)) {
          makeMove({
            start: selectedSquare,
            end: { row, col },
          });
        }
        setSelectedSquare(null);
      } else {
        if (board[row][col]) setSelectedSquare({ row, col });
      }
    },
    [board, selectedSquare, makeMove]
  );

  return { selectedSquare, handleSquareClick };
}

export default useMoves;
