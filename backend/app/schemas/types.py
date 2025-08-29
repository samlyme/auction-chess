from datetime import datetime
from typing import Annotated, Literal, Union
from uuid import UUID
from pydantic import BaseModel, Field

# For the love of god please keep types here
# from app.core.auction_chess.types import Color, PieceType

Color = Literal["w", "b"]
PieceType = Literal["p", "r", "n", "b", "q", "k"]
GamePhase = Literal["bid", "move"]

class Player(BaseModel):
    color: Color
    uuid: UUID


class BoardPosition(BaseModel):
    row: int = Field(..., ge=0, le=7)  # 0-7
    col: int = Field(..., ge=0, le=7)  # 0-7


class Move(BaseModel):
    start: BoardPosition
    end: BoardPosition


class Piece(BaseModel):
    type: PieceType
    color: Color
    has_moved: bool = False  # Useful for castling, initial pawn moves


BoardPieces = list[list[Piece | None]]

LegalMoves = list[list[list[BoardPosition]]]



# Users and such
class UserCredentials(BaseModel):
    username: str
    password: str


class UserProfile(BaseModel):
    uuid: UUID
    username: str
    created_at: datetime

    # Required because user can change username
    def __eq__(self, value: object) -> bool:
        if not isinstance(value, UserProfile):
            return NotImplemented
        
        return self.uuid == value.uuid


class UserCreate(BaseModel):
    username: str
    password: str


# Can add more JWT fields later
class JWTPayload(BaseModel):
    exp: datetime
    sub: UUID


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


LobbyIdLength = 5
LobbyId = str
LobbyStatus = Literal["active", "pending"]

class LobbyProfile(BaseModel):
    id: LobbyId
    status: LobbyStatus
    host: UserProfile
    guest: UserProfile | None
    

PacketType = Literal["lobby_packet", "game_packet"]

class LobbyPacket(BaseModel):
    type: PacketType = "lobby_packet"
    content: LobbyProfile

class GamePacket(BaseModel):
    type: PacketType = "game_packet"
    board: BoardPieces
    moves: LegalMoves

    white: UUID
    black: UUID

Packet = Annotated[ 
    Union[LobbyPacket, GamePacket],
    Field(discriminator="type")
]