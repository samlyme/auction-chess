import useGame from "../hooks/useGame";
import type { BoardPosition, Piece } from "../schemas/types";
import { pieceSVGMap } from "../utils/chess";
import "./Board.css";
import useMoves from "../hooks/useMoves";

function Board() {
  const { board, moves, userColor } = useGame();
  const { selectedSquare, handleSquareClick } = useMoves();

  if (!board || !moves) return (
    <div>Loading board</div>
  )

  const squares = [];
  for (let row = 7; row >= 0; row--) {
    for (let col = 0; col <= 7; col++) {
      const colorClass = (row + col) % 2 == 0 ? "light-square" : "dark-square";

      const legalMoves: BoardPosition[] | null = selectedSquare && moves[selectedSquare.row][selectedSquare.col]

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
          isLegal={
            legalMoves != null &&
            legalMoves.some(
              (elem: BoardPosition) => elem.row == row &&  elem.col == col
            )
          }

          onClick={() => handleSquareClick({ row, col })}
        />
      );
    }
  }

  if (userColor == "b") squares.reverse()

  // TODO: Fix game board component
  return (
    <div className="game">
      <div className="board">{squares}</div>
    </div>
  );
}

function Square({
  key,
  colorClass,
  piece,
  isSelected,
  isLegal,
  onClick,
}: {
  key: string;
  colorClass: string;
  piece: Piece | null;
  isSelected: boolean;
  isLegal: boolean;
  onClick: () => void;
}) {
  return (
    <div
      key={key}
      className={`square ${colorClass} ${isSelected ? "selected-square" : ""} ${isLegal ? "legal-square" : ""}`}
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
