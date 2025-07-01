from abc import ABC, abstractmethod
from uuid import uuid1

from app.core.auction_chess.board import Board, Color, GamePhase, Marker, Move, Position
from app.core.auction_chess.rules import effects, en_passant_test_board_factory, pawn_double_move_effect, set_has_moved_effect

# All the types defined here are for the interface between BE and FE
from app.core.utils import PriorityQueue
import app.schemas.types as api

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