from typing import Callable, Iterable, Literal

Color = Literal["w", "b"]
PieceType = Literal["p", "r", "n", "b", "q", "k"]
GamePhase = Literal["bid", "move"]

Position = tuple[int, int]

class Piece:
    type: PieceType
    color: Color
    hasMoved: bool = False  # Useful for castling, initial pawn moves

    def __init__(self, type: PieceType, color: Color, hasMoved: bool = False):
        self.type = type
        self.color = color
        self.hasMoved = hasMoved
        

# This is for "special" rules like en passent, promotion, and castling
MarkerTarget = Callable[[Piece], bool]
Effect = Callable[[], None]

# TODO: make marker a subclass of Board
# - Board should be in control of how markers are created and used
# - Board should not be responsible for managing the expiration of markers
class Marker:
    target: MarkerTarget
    effect: Effect

    def __init__(self, target: MarkerTarget, effect: Effect) -> None:
        self.target = target
        self.effect = effect

class Move:
    start: Position
    end: Position
    effect: Effect

    def __init__(self, start: Position, end: Position, effect: Effect = lambda: None) -> None:
        self.start = start
        self.end = end
        self.effect = effect

class Square:
    piece: Piece | None
    marker: Marker | None

    def __init__(self, piece: Piece | None = None, marker: Marker | None = None) -> None:
        self.piece = piece
        self.marker = marker

BoardState = list[list[Square]]
BoardFactory = Callable[[], BoardState]

MarkerPlacer = Callable[[BoardState], None]
class Board:
    board_state: BoardState
    rows: int
    cols: int

    def __init__(self, board_factory: BoardFactory, markers: Iterable[tuple[Position, Marker]] = []) -> None:
        self.board_state = board_factory()
        self.rows = len(self.board_state)
        self.cols = len(self.board_state[0])

        for pos, marker in markers:
            self.add_marker(pos, marker)

    def square_at(self, position: Position) -> Square:
        return self.board_state[position[0]][position[1]]
    
    def piece_at(self, position: Position) -> Piece:
        square = self.square_at(position)
        if not square.piece:
            raise Exception("No piece there.")
        return square.piece

    def add_marker(self, position: Position, marker: Marker) -> None:
        self.square_at(position).marker = marker

    def remove_marker(self, position: Position, marker: Marker) -> None:
        self.square_at(position).marker = None

    def validate_position(self, position: Position):
        row, col = position
        if row < 0 or row >= self.rows or col < 0 or col >= self.cols:
            raise Exception("Invalid Position")
    
    def get(self, position: Position) -> Square:
        self.validate_position(position)

        row, col = position
        return self.board_state[row][col]
    
    def move(self, move: Move):
        start, end = move.start, move.end

        start_square: Square = self.get(start)
        piece: Piece | None = start_square.piece
        if not piece:
            raise Exception("Bad Move: start had no piece")
        end_square: Square = self.get(end)
        
        end_square.piece = start_square.piece
        start_square.piece = None

        # ALL MOVE EFFECTS HAPPEN AFTER THE BOARD MOVES
        move.effect()

        marker: Marker | None = end_square.marker
        if marker and marker.target(piece):
            marker.effect()
            
            

        