from abc import ABC, abstractmethod
from typing import Callable, Iterable, Literal
from uuid import UUID

Position = tuple[int, int]

# Effect should NOT be changed from this type because it can be called from board.
# Effects should be able to change anything in the game.
# The variables that effects have access to should defined in the effect factory
# function.
Effect = Callable[[], None]
MarkerTarget = Callable[["Piece"], bool]

Color = Literal["w", "b"]
PieceType = Literal["p", "r", "n", "b", "q", "k"]
GamePhase = Literal["bid", "move"]


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

    def __init__(
        self, start: Position, end: Position, effect: Effect = lambda: None
    ) -> None:
        self.start = start
        self.end = end
        self.effect = effect

    def __repr__(self) -> str:
        return f"<Move (start={self.start} end={self.end})>"


# TODO: implement on capture
class Piece(ABC):
    hasMoved: bool = False  # Useful for castling, initial pawn moves
    color: Color
    name: str
    initial: PieceType
    # Trust that board class sets this properly
    position: Position
    game: "Game"

    def __init__(
        self, 
        game: "Game",
        color: Color, 
        name: str, 
        initial: PieceType, 
        position: Position, 
        hasMoved: bool = False
    ):
        self.game = game
        self.hasMoved = hasMoved
        self.color = color
        self.name = name
        self.initial = initial
        self.position = position
        

    def __repr__(self) -> str:
        return self.initial if self.color == "b" else self.initial.upper()

# TODO: refactor this to take in a Board object
    @abstractmethod
    def moves(self, board: "Board") -> Iterable[Move]:
        pass


class Square:
    piece: Piece | None
    marker: Marker | None
    attacked_by: list[Piece] = []

    def __init__(
        self, piece: Piece | None = None, marker: Marker | None = None
    ) -> None:
        self.piece = piece
        self.marker = marker


BoardState = list[list[Square]]
BoardFactory = Callable[[], BoardState]
MarkerPlacer = Callable[[BoardState], None]



class Game(ABC):

    @abstractmethod
    def __init__(self, white: UUID, black: UUID):
       pass 

    @abstractmethod
    def add_marker(self, position: Position, marker: Marker, expires: int = -1):
        pass
    
    @abstractmethod
    def move(self, move: Move) -> None:
        pass

    @abstractmethod
    def capture(self, position: Position):
        pass

class Board(ABC):
    board_state: BoardState
    rows: int
    cols: int

    @abstractmethod
    def square_at(self, position: Position) -> Square:
        pass
    
    @abstractmethod
    def piece_at(self, position: Position) -> Piece:
        pass
    
    @abstractmethod
    def add_marker(self, position: Position, marker: Marker) -> None:
        pass
    
    @abstractmethod
    def remove_marker(self, position: Position) -> None:
        pass

    @abstractmethod
    def validate_position(self, position: Position) -> None:
        pass
    
    @abstractmethod
    def move(self, move: Move) -> Piece | None:
        # Returns the piece captured
        pass