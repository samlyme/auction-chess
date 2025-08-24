from datetime import datetime
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, Field

from app.core.auction_chess.types import Color, PieceType


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


class GamePacket(BaseModel):
    board: BoardPieces


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


LobbyId = str

# maybe needed?
LobbyIdLength = 5

LobbyStatus = Literal["active", "pending"]

class LobbyProfile(BaseModel):
    id: LobbyId
    status: LobbyStatus
    host: UserProfile
    guest: UserProfile | None