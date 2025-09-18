from datetime import datetime
from typing import Annotated, Literal, Union
from uuid import UUID
from pydantic import BaseModel, Field
import pydantic

from main import AuctionStyle, Bid as GameBid
from chess import Color, WHITE, BLACK  # noqa: F401


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


# For the love of god please keep types here

PieceType = Literal["p", "r", "n", "b", "q", "k"]
PeiceSymbols = PieceType | Literal["P", "R", "N", "B", "Q", "K"]
GamePhase = Literal["bid", "move"]
GameOutcome = Color | None


class Player(BaseModel):
    color: Color
    uuid: UUID


class BoardPosition(BaseModel):
    row: int = Field(..., ge=0, le=7)  # 0-7
    col: int = Field(..., ge=0, le=7)  # 0-7


# TODO: refactor this to extend from chess move class.
class Move(BaseModel):
    start: BoardPosition
    end: BoardPosition

    # TODO: Fix the API to not have to do this jank
    def uci(self) -> str:
        files = "ABCDEFGH"
        return (
            files[self.start.col]
            + str(self.start.row + 1)
            + files[self.end.col]
            + str(self.end.row + 1)
        )


# TODO: At the api level, bids and moves do not need to include the current user.
# But somewhere down the line, maybe at the LobbyDep level, we would need to
# validate the "source" of the bid and move request.
@pydantic.dataclasses.dataclass(frozen=True)
class Bid(GameBid):
    pass


BoardPieces = list[list[PeiceSymbols | None]]

MoveUCI = str
LegalMoves = list[MoveUCI]

LobbyIdLength = 5
LobbyId = str
LobbyStatus = Literal["active", "pending"]


class LobbyProfile(BaseModel):
    id: LobbyId
    status: LobbyStatus
    host: UserProfile
    guest: UserProfile | None


class GameOptions(BaseModel):
    host_color: Color


PacketType = Literal["lobby_packet", "game_packet"]


class LobbyPacket(BaseModel):
    type: PacketType = "lobby_packet"
    content: LobbyProfile


Players = dict[Color, UUID]
Balances = dict[Color, int]
OpenBidHistory = list[list[Bid]]


class OpenFirst(BaseModel):
    auction_style: AuctionStyle = "open_first"
    bid_history: OpenBidHistory


AuctionData = Annotated[Union[OpenFirst], Field(discriminator="auction_style")]


class GameData(BaseModel):
    outcome: GameOutcome

    phase: GamePhase
    bid_turn: Color
    turn: Color

    board: BoardPieces
    moves: LegalMoves

    players: Players
    balances: Balances

    auction_data: AuctionData


class GamePacket(BaseModel):
    type: PacketType = "game_packet"

    content: GameData


Packet = Annotated[Union[LobbyPacket, GamePacket], Field(discriminator="type")]
