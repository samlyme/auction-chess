from typing import Literal, Optional
from pydantic import BaseModel, Field

Color = Literal["w", "b"]
PieceType = Literal["p", "r", "n", "b", "q", "k"]


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

BoardState = list[list[Optional[Piece]]]

class Game(BaseModel):
    board: BoardState
