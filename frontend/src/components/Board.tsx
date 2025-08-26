import useGame from "../hooks/useGame";
import type { Piece } from "../schemas/types";
import { pieceSVGMap } from "../utils/chess";
import "./Board.css";
import useMoves from "../hooks/useMoves";
import { useAuthContext } from "../contexts/Auth";

function Board() {
  const { board, makeMove } = useGame();
  const { selectedSquare, handleSquareClick } = useMoves(board, makeMove);
  const {user} = useAuthContext();

  if (!board) return (
    <div>Loading board</div>
  )

  const squares = [];
  for (let row = 7; row >= 0; row--) {
    for (let col = 0; col <= 7; col++) {
      const colorClass = (row + col) % 2 == 0 ? "light-square" : "dark-square";

      const piece = board[row][col];

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

  // TODO: Fix game board component
  return (
    <div className="game">
      <div className="board">{squares}</div>
      <p>Playing as {user?.username}</p>
    </div>
  );
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
