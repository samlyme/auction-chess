import { useState } from "react";
import useGame from "../hooks/useGame";
import type { BoardPosition, Piece } from "../lib/types";
import { pieceSVGMap } from "../lib/utils";
import "./Board.css";

function Board() {
  const { game, makeMove, isConnected, error } = useGame();
  const [selected, setSelected] = useState<BoardPosition | null>(null);

  if (error) return <div>Error: {error}</div>;
  if (!isConnected) return <div>Connecting to game...</div>;
  if (!game) return <div>Loading game state...</div>;

  const squares = [];
  for (let row = 7; row >= 0; row--) {
    for (let col = 0; col <= 7; col++) {
      const colorClass = (row + col) % 2 == 0 ? "light-square" : "dark-square";

      const piece = game.board[row][col];

      squares.push(
        <Square
          key={`${row}-${col}`}
          colorClass={colorClass}
          piece={piece}
          boardPosition={{ row, col }}
          selected={selected}
          setSelected={setSelected}
        />
      );
    }
  }

  return <div className="board">{squares}</div>;
}

function Square({
  key,
  colorClass,
  piece,
  boardPosition,
  selected,
  setSelected,
}: {
  key: string;
  colorClass: string;
  piece: Piece | null;
  boardPosition: BoardPosition;
  selected: BoardPosition | null;
  setSelected: (p: BoardPosition) => void;
}) {
  const handleClick = () => {
    if (piece) setSelected(boardPosition);
  };

  const isSelected =
    selected &&
    selected.row === boardPosition.row &&
    selected.col == boardPosition.col;

  return (
    <div
      key={key}
      className={`square ${colorClass} ${isSelected ? "selected-square" : ""}`}
      onClick={handleClick}
    >
      {piece && (
        <img
          src={pieceSVGMap[`${piece.type}${piece.color}`]}
          alt={`${piece.color}-${piece.type}`} // Provide good alt text
          className="piece-image"
        />
      )}
    </div>
  );
}

export default Board;
