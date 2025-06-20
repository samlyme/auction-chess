import useGame from "../hooks/useGame";
import type { BoardPosition, Piece } from "../lib/types";
import { pieceSVGMap } from "../lib/utils";
import "./Board.css";
import useMoves from "../hooks/useMoves";

function Board() {
  const { game, makeMove, isConnected, error } = useGame();
  const { selectedSquare, handleSquareClick } = useMoves(game, makeMove);

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
          isSelected={
            selectedSquare != null &&
            selectedSquare.row == row &&
            selectedSquare.col == col
          }
          onClick={() => handleSquareClick({ row, col })}
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
  isSelected,
  onClick,
}: {
  key: string;
  colorClass: string;
  piece: Piece | null;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      key={key}
      className={`square ${colorClass} ${isSelected ? "selected-square" : ""}`}
      onClick={onClick}
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
