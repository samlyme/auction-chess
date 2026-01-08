// src/hooks/useChessMoves.ts
import { useState, useCallback } from "react";
import type { BoardPosition, Move, PieceSymbol } from "../schemas/types"; // Import your types
import useGame from "./useGame";
import { boardPositionToIndex, pieceSymbolColor } from "../utils/chess";

interface UseMovesReturn {
  selectedPosition: BoardPosition | null;
  handleSquareClick: (p: BoardPosition) => void;
}

function useMoves(): UseMovesReturn {
  const { game, makeMove, userColor } = useGame();
  const { board, moves } = game!;
  const [selectedPosition, setSelectedPosition] =
    useState<BoardPosition | null>(null);

  const handleSquareClick = useCallback(
    (pos: BoardPosition) => {
      console.log("Clicked sqaure: ", pos);

      if (!board || !moves) return;

      const { row: newRow, col: newCol } = boardPositionToIndex(pos);

      const piece: PieceSymbol | null = board[newRow][newCol];
      if (!selectedPosition && !piece) return;

      // if player is white, and selected piece is not white, early return
      // similarly, if player is black, and selected piece is not black, early return.
      if (!selectedPosition && piece && userColor !== pieceSymbolColor(piece))
        return;

      // Base case, nothing is currently selected and clicked on own piece
      if (!selectedPosition && piece && pieceSymbolColor(piece) === userColor) {
        setSelectedPosition(pos);
        return;
      }

      // Clicked on currently selected square
      if (selectedPosition) {
        const { row: oldRow, col: oldCol } =
          boardPositionToIndex(selectedPosition);
        if (oldRow == newRow && oldCol == newCol) {
          setSelectedPosition(null);
          return;
        }
      }

      // Something has been selected, and you clicked on another square.
      // This "tries" to make a move. If move is legal, a request is made.
      // Either case, sets the selected back to null.
      if (selectedPosition) {
        const moveUCI: Move = selectedPosition + pos;
        if (moves.includes(moveUCI)) {
          makeMove(moveUCI);
        }
        setSelectedPosition(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [board, selectedPosition, makeMove],
  );

  return { selectedPosition, handleSquareClick };
}

export default useMoves;
