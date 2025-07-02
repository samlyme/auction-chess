from abc import ABC, abstractmethod
from typing import Callable, Iterable

import app.schemas.types as api

Position = tuple[int, int]

# TODO: write board and game abstract classes

# Effect should NOT be changed from this type because it can be called from board.
# Effects should be able to change anything in the game.
# The variables that effects have access to should defined in the effect factory
# function.
Effect = Callable[[], None]
MarkerTarget = Callable[["Piece"], bool]


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


# TODO: implement on capture
class Piece(ABC):
    hasMoved: bool = False  # Useful for castling, initial pawn moves
    color: api.Color
    name: str
    initial: api.PieceType
    # Trust that board class sets this properly
    position: Position

    def __init__(
        self, 
        color: api.Color, 
        name: str, 
        initial: api.PieceType, 
        position: Position, 
        hasMoved: bool = False
    ):
        self.hasMoved = hasMoved
        self.color = color
        self.name = name
        self.initial = initial
        self.position = position
        

    def __repr__(self) -> str:
        return self.initial if self.color == "b" else self.initial.upper()

# TODO: refactor this to take in a Board object
    @abstractmethod
    def moves(self, board: "BoardState") -> Iterable[Move]:
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
    def __init__(self, white: api.Player, black: api.Player):
       pass 

    @abstractmethod
    def add_marker(self, position: Position, marker: Marker, expires: int = -1):
        pass
    
    @abstractmethod
    def move(self, move: api.Move) -> None:
        pass

class Board(ABC):

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
    def move(self, move: Move) -> Piece | None:
        # Returns the piece captured
        pass