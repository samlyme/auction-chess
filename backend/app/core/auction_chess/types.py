from abc import ABC, abstractmethod
from typing import Callable
from uuid import UUID
import app.schemas.types as api

Position = tuple[int, int]

# Effect should NOT be changed from this type because it can be called from board.
# Effects should be able to change anything in the game.
# The variables that effects have access to should defined in the effect factory
# function.
Effect = Callable[[], None]
MarkerTarget = Callable[["Piece"], bool]

Color = api.Color
PieceType = api.PieceType
GamePhase = api.GamePhase


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
    
    def public(self) -> api.Move:
        return api.Move(
            start=api.BoardPosition(row=self.start[0], col=self.start[1]),
            end=api.BoardPosition(row=self.end[0], col=self.end[1])
        )


# TODO: implement on capture
class Piece(ABC):
    hasMoved: bool = False  # Useful for castling, initial pawn moves
    color: Color
    name: str
    initial: PieceType
    # Trust that board class sets this properly
    position: Position
    game: "Game"
    attacking: set["Square"]

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

        self.attacking = set()
        
    def __repr__(self) -> str:
        return self.initial if self.color == "b" else self.initial.upper()

    def clear_attacking(self):
        for square in self.attacking:
            square.remove_attacker(self)

        self.attacking.clear()


    @abstractmethod
    def public_piece(self) -> api.Piece:
        pass

    @abstractmethod
    def moves(self, board: "Board") -> tuple[list[Move], list[Move]]:
        pass


class Square:
    piece: Piece | None
    position: Position
    marker: Marker | None
    attacked_by: set[Piece]

    def __init__(
        self, position: Position, piece: Piece | None = None, marker: Marker | None = None
    ) -> None:
        self.position = position
        self.piece = piece
        self.marker = marker
        self.attacked_by = set()

    def __repr__(self) -> str:
        return f"Square {self.position}"

    def add_attacker(self, piece: Piece) -> None:
        self.attacked_by.add(piece)

    def remove_attacker(self, piece: Piece) -> None:
        self.attacked_by.remove(piece)


BoardState = list[list[Square]]
BoardFactory = Callable[[], BoardState]
MarkerPlacer = Callable[[BoardState], None]



class Game(ABC):
    players: dict[Color, UUID]

    @abstractmethod
    def __init__(self, white: UUID, black: UUID):
       pass 

    @abstractmethod
    def add_marker(self, position: Position, marker: Marker, expires: int = -1):
        pass
    
    @abstractmethod
    def user_move(self, user: api.UserProfile, move: api.Move) -> None:
        pass

    @abstractmethod
    def move(self, move: api.Move) -> None:
        pass

    @abstractmethod
    def capture(self, position: Position):
        pass
    
    @abstractmethod
    def public_board(self) -> api.BoardPieces:
        pass

    @abstractmethod
    def public_moves(self) -> api.LegalMoves:
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