import useGame from "../hooks/useGame";
import { pieceSVGMap } from "../lib/utils";
import "./Board.css";

function Board() {
  const { game, makeMove, isConnected, error } = useGame();

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isConnected) {
    return <div>Connecting to game...</div>;
  }

  if (!game) {
    return <div>Loading game state...</div>; // Render a loading state until game is received
  }

  // console.log("Current game (deep clone): ", JSON.parse(JSON.stringify(game)));
  // // Or to distinguish null/undefined clearly:
  console.log("Current game (value): ", game);
  console.log("Current game board (value): ", game.board);
  const gameAsString = JSON.stringify(game);
  const weird = JSON.parse(gameAsString);
  console.log("Weird", weird);
  console.log("Weird board", weird.board);
  const squares = [];
  // Loop to create 64 squares
  for (let i = 0; i < 64; i++) {
    const row = Math.floor(i / 8);
    const col = i % 8;
    // Determine square color based on row and column
    const isLightSquare = (row + col) % 2 === 0;
    const squareColorClass = isLightSquare ? "light-square" : "dark-square";

    let piece = game["board"][row][col];
    let pieceSVG = null;
    if (piece) {
      // Construct the key for the pieceSVGMap
      const pieceKey = `${piece.type}${piece.color}`; // e.g., 'pb', 'kw'
      pieceSVG = pieceSVGMap[pieceKey];
    }

    squares.push(
      <div key={`${row}-${col}`} className={`square ${squareColorClass}`}>
        {pieceSVG && (
          <img
            src={pieceSVG}
            alt={`${piece?.color}-${piece?.type}`} // Provide good alt text
            className="piece-image"
          />
        )}
      </div>
    );
  }

  return <div className="board">{squares}</div>;
}

export default Board;
