import "./Board.css"; 

function Board() {
  const squares = [];
  // Loop to create 64 squares
  for (let i = 0; i < 64; i++) {
    const row = Math.floor(i / 8);
    const col = i % 8;
    // Determine square color based on row and column
    const isLightSquare = (row + col) % 2 === 0;
    const squareColorClass = isLightSquare ? "light-square" : "dark-square";

    squares.push(
      <div key={i} className={`square ${squareColorClass}`}>
        {/* Placeholder for piece later */}
      </div>
    );
  }

  return <div className="board">{squares}</div>;
};

export default Board;