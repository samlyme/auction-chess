from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field

from app.core.auction_chess.board import Color, PieceType


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
    hasMoved: bool = False  # Useful for castling, initial pawn moves


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
    createdAt: datetime


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
