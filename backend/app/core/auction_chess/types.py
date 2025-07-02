from abc import ABC, abstractmethod
from typing import Callable, Iterable

from app.schemas.types import Color, PieceType


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


class Piece(ABC):
    hasMoved: bool = False  # Useful for castling, initial pawn moves
    color: Color
    name: str
    initial: PieceType
    # Trust that board class sets this properly
    position: Position

    def __init__(
        self, 
        color: Color, 
        name: str, 
        initial: PieceType, 
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

    @abstractmethod
    def moves(self, board_state: "BoardState") -> Iterable[Move]:
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
