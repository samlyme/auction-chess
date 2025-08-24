import random

from app.schemas.types import LobbyId, LobbyIdLength

ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

def generate_lobby_id() -> LobbyId:
    return "".join(random.choices(ALPHABET, k=LobbyIdLength))