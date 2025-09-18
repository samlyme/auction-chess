from datetime import datetime
from typing import Annotated, Literal, Union
from uuid import UUID
from pydantic import BaseModel, Field

from game.main import AuctionStyle, Bid as GameBid
import pydantic


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
Color = Literal["w", "b"]
PeiceSymbols = Literal["p", "r", "n", "b", "q", "k", "P", "R", "N", "B", "Q", "K"]
GamePhase = Literal["bid", "move"]
GameOutcome = Color | Literal["draw"] | None


BoardPieces = list[list[PeiceSymbols | None]]
Move = str  # must be valid UCI


@pydantic.dataclasses.dataclass(frozen=True)
class Bid(GameBid):
    """
    # The inheritance takes care of it. A lil cursed ik.
    amount: int
    fold: bool
    """


LobbyIdLength = 5
LobbyId = str
LobbyStatus = Literal["active", "pending"]


class LobbyOptions(BaseModel):
    is_public: bool


class GameOptions(BaseModel):
    host_color: Color


class LobbyProfile(BaseModel):
    id: LobbyId
    status: LobbyStatus
    host: UserProfile
    guest: UserProfile | None
    lobby_options: LobbyOptions
    game_options: GameOptions


PacketType = Literal["lobby_packet", "game_packet"]


class LobbyPacket(BaseModel):
    type: PacketType = "lobby_packet"
    content: LobbyProfile


Players = dict[Color, UserProfile]
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
    moves: list[Move]

    players: Players
    balances: Balances

    auction_data: AuctionData


class GamePacket(BaseModel):
    type: PacketType = "game_packet"

    content: GameData


Packet = Annotated[Union[LobbyPacket, GamePacket], Field(discriminator="type")]
