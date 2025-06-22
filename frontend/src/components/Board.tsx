import useGame from "../hooks/useGame";
import type { Piece, UserProfile } from "../schemas/types";
import { pieceSVGMap } from "../utils/chess";
import "./Board.css";
import useMoves from "../hooks/useMoves";
import useUser from "../hooks/useUser";

function Board() {
  const { game, makeMove, isConnected, error } = useGame();
  const { selectedSquare, handleSquareClick } = useMoves(game, makeMove);
  const user: UserProfile | null = useUser();

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
