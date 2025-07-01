from abc import ABC, abstractmethod

from app.core.auction_chess.board import Marker, Position

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