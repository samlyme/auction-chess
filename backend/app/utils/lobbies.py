import random
from typing import Any

from app.schemas.types import LobbyId, LobbyIdLength
from game.core.main import AuctionChess, OpenFirstAuctionChess

ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

def generate_lobby_id() -> LobbyId:
    return "".join(random.choices(ALPHABET, k=LobbyIdLength))

def game_factory(game_options: Any) -> AuctionChess:
    # TODO: implement game_factory
    return OpenFirstAuctionChess(
        fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    ) 