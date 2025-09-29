import useGame from '../hooks/useGame';
import type { Move, PieceSymbol } from '../schemas/types';
import {
  boardPositionToIndex,
  indexToBoardPosition,
  pieceSVGMap,
  pieceSymbolColor,
} from '../utils/chess';
import './Board.css';
import useMoves from '../hooks/useMoves';

function Board() {
  const { game, userColor } = useGame();
  const { board, moves } = game!;
  const { selectedPosition, handleSquareClick } = useMoves();

  if (!board || !moves) return <div>Loading board</div>;

  const squares = [];
  for (let row = 7; row >= 0; row--) {
    for (let col = 0; col <= 7; col++) {
      const colorClass = (row + col) % 2 == 0 ? 'light-square' : 'dark-square';

      const piece = board[row][col];

      let isSelected: boolean = false;
      let isLegal: boolean = false;
      if (selectedPosition) {
        const { row: selectedRow, col: selectedCol } =
          boardPositionToIndex(selectedPosition);
        if (row === selectedRow && col == selectedCol) {
          isSelected = true;
        }

        const moveUCI: Move = selectedPosition + indexToBoardPosition(row, col);
        if (moves.includes(moveUCI)) {
          isLegal = true;
        }
      }

      squares.push(
        <Square
          key={`${row}-${col}`}
          colorClass={colorClass}
          piece={piece}
          isSelected={isSelected}
          isLegal={isLegal}
          onClick={() => handleSquareClick(indexToBoardPosition(row, col))}
        />
      );
    }
  }

  if (userColor == 'b') squares.reverse();

  // TODO: Fix game board component
  return <div className="board">{squares}</div>;
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
  piece: PieceSymbol | null;
  isSelected: boolean;
  isLegal: boolean;
  onClick: () => void;
}) {
  return (
    <div
      key={key}
      className={`square ${colorClass} ${isSelected ? 'selected-square' : ''} ${isLegal ? 'legal-square' : ''}`}
      onClick={onClick}
    >
      {piece && (
        <img
          src={pieceSVGMap[`${piece.toLowerCase()}${pieceSymbolColor(piece)}`]}
          alt={`${piece}`} // Provide good alt text
          className="piece-image"
        />
      )}
    </div>
  );
}

export default Board;
