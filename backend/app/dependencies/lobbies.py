from typing import Annotated, Any, Awaitable, Callable
from uuid import UUID
from chess import IllegalMoveError
from fastapi import Depends, WebSocket, status

from backend.app.dependencies.auth import CurrentUserDep
from game.main import AuctionChess

import backend.app.schemas.types as api
from backend.app.utils.exceptions import (
    LobbyCreateError,
    LobbyJoinError,
    LobbyLeaveError,
    LobbyNotFoundError,
    LobbyPermissionError,
    LobbyStartError,
)
from backend.app.utils.lobbies import game_factory, generate_lobby_id


class Lobby:
    """Recommended to use named function args"""

    def __init__(
        self,
        manager: "LobbyManager",
        id: api.LobbyId,
        host: api.UserProfile,
        # TODO: implement lobby_options
        lobby_options: api.LobbyOptions,
        status: api.LobbyStatus = "pending",
        host_ws: WebSocket | None = None,
        guest: api.UserProfile | None = None,
        guest_ws: WebSocket | None = None,
        # TODO: Implement game options
        game_options: api.GameOptions = api.GameOptions(host_color="w"),
        game: AuctionChess | None = None,
    ) -> None:
        self.manager: "LobbyManager" = manager
        self.id: api.LobbyId = id
        self.host: api.UserProfile = host
        self.lobby_options: api.LobbyOptions = lobby_options

        self.status: api.LobbyStatus = status
        self.host_ws: WebSocket | None = host_ws

        self.guest: api.UserProfile | None = guest
        self.guest_ws: WebSocket | None = guest_ws

        self.game_options: api.GameOptions = game_options

        self.game: AuctionChess | None = game

    async def delete(self, user: api.UserProfile) -> None:
        if user != self.host:
            raise LobbyPermissionError(user=user, lobby_id=self.id)

        await self.manager._delete(self.id)

    async def set_lobby_options(
        self, user: api.UserProfile, lobby_options: api.LobbyOptions
    ) -> None:
        if user != self.host:
            raise LobbyPermissionError(user=user, lobby_id=self.id)

        # TODO: make this actually do something.
        self.lobby_options = lobby_options

    async def set_game_options(self, user: api.UserProfile, game_options: Any) -> None:
        if user != self.host:
            raise LobbyPermissionError(user=user, lobby_id=self.id)

        if self.status == "active":
            # TODO: make exception for this
            raise Exception("Can't make changes to game options in active lobby.")

        # TODO: make this actually do something.
        self.game_options = game_options

    async def join(self, user: api.UserProfile) -> None:
        if self.guest:
            raise LobbyJoinError(user=user, lobby_id=self.id, reason="Lobby already full")

        self.guest = user
        self.manager._add_user(user, self.id)

    async def leave(self, user: api.UserProfile) -> None:
        if user == self.host:
            raise LobbyLeaveError(user=user, lobby_id=self.id, reason="Host can not leave lobby.")

        if user != self.guest:
            raise LobbyLeaveError(user=user, lobby_id=self.id, reason="User is not guest of this lobby.")

        self.guest = None
        if self.guest_ws:
            await self.guest_ws.close(code=status.WS_1000_NORMAL_CLOSURE)

        self.manager._remove_user(user)

    async def start(self, user: api.UserProfile) -> None:
        if user != self.host:
            raise LobbyPermissionError(user=user, lobby_id=self.id)

        if not self.guest:
            raise LobbyStartError(user=user, lobby_id=self.id, reason="Lobby not full. Need guest.")

        self.status = "active"
        self.game = game_factory(self.game_options)
        await self.broadcast_lobby()
        await self.broadcast_game()

    def to_profile(self) -> api.LobbyProfile:
        return api.LobbyProfile(
            id=self.id,
            status=self.status,
            host=self.host,
            guest=self.guest,
            lobby_options=self.lobby_options,
            game_options=self.game_options,
        )

    async def set_websocket(self, websocket: WebSocket, user: api.UserProfile) -> None:
        if user == self.host:
            self.host_ws = websocket
        elif user == self.guest:
            self.guest_ws = websocket
        else:
            raise LobbyPermissionError(user=user, lobby_id=self.id)

        await self.broadcast_lobby()
        if self.game:
            await self.broadcast_game()

    async def remove_websocket(self, user: api.UserProfile) -> None:
        if user == self.host:
            self.host_ws = None
        elif user == self.guest:
            self.guest_ws = None
        else:
            raise LobbyPermissionError(user=user, lobby_id=self.id)

    async def broadcast_lobby(self) -> None:
        packet: api.LobbyPacket = api.LobbyPacket(content=self.to_profile())

        data = packet.json()
        if self.host_ws:
            await self.host_ws.send_text(data)
        if self.guest_ws:
            await self.guest_ws.send_text(data)

    def serialize_board(self) -> api.BoardPieces:
        if not self.game:
            raise Exception("Game not initiallized.")

        return [
            [
                (lambda x: x.symbol() if x else None)(
                    self.game.piece_at(rank * 8 + file)
                )
                for file in range(8)
            ]
            for rank in range(8)
        ]  # type: ignore

    async def broadcast_game(self):
        if not self.game:
            raise Exception("Game not initiallized")

        if not self.guest:
            raise Exception("Guest is nulled at weird spot.")

        packet: api.GamePacket = api.GamePacket(
            content=api.GameData(
                outcome=(lambda o: ("w" if o.winner else "b") if o else None)(
                    self.game.outcome()
                ),  # TODO: fix this
                phase=self.game.phase,
                bid_turn="w" if self.game.bid_turn else "b",
                turn="w" if self.game.turn else "b",
                board=self.serialize_board(),
                moves=[move.uci() for move in self.game.legal_moves],
                players={
                    "w"
                    if self.game_options.host_color
                    else "b": self.host,
                    "b"
                    if self.game_options.host_color
                    else "w": self.guest,
                },
                balances={"w" if color else "b" : balance for color, balance in self.game.balances.items()},
                auction_data=api.OpenFirst(
                    bid_history=[
                        [api.Bid(amount=bid.amount, fold=bid.fold) for bid in bid_stack]
                        for bid_stack in self.game.bid_history
                    ]
                ),
            )
        )

        data = packet.json()
        if self.host_ws:
            await self.host_ws.send_text(data)
        if self.guest_ws:
            await self.guest_ws.send_text(data)

    async def make_move(self, user: api.UserProfile, move: api.Move):
        if not self.game:
            raise Exception("Game not started")

        if self.user_color(user) != ("w" if self.game.turn else "b"):
            raise IllegalMoveError("Not your turn.")

        self.game.push_uci(move)
        await self.broadcast_game()

    async def make_bid(self, user: api.UserProfile, bid: api.Bid):
        if not self.game:
            raise Exception("Game not started")
        
        if self.user_color(user) != ("w" if self.game.bid_turn else "b"):
            raise IllegalMoveError("Not your turn.")

        self.game.push_bid(bid)
        await self.broadcast_game()

    def user_color(self, user: api.UserProfile) -> api.Color: # TODO: implement better typing
        if user == self.host:
            return self.game_options.host_color
        elif user == self.guest:
            return "w" if self.game_options.host_color == "b" else "b"
        else:
            raise LobbyPermissionError(user=user, lobby_id=self.id)


# NOTE: In future, this should be in redis
class LobbyManager:
    def __init__(self) -> None:
        self.lobbies: dict[api.LobbyId, Lobby] = {}
        self.active_users: dict[UUID, api.LobbyId] = {}

    async def get(self, lobby_id: api.LobbyId) -> Lobby | None:
        return self.lobbies.get(lobby_id)

    async def get_lobby_id_by_user_id(self, user_id: UUID) -> api.LobbyId | None:
        return self.active_users.get(user_id)

    def _add_user(self, user: api.UserProfile, lobby_id: api.LobbyId):
        if user.uuid in self.active_users:
            raise Exception("_add_user called with user that is currently active.")
        self.active_users[user.uuid] = lobby_id

    def _remove_user(self, user: api.UserProfile):
        if user.uuid not in self.active_users:
            raise Exception(
                "_remove_user called with user that is not currently active."
            )
        del self.active_users[user.uuid]

    async def _delete(self, lobby_id: api.LobbyId):
        lobby = await self.get(lobby_id)
        if not lobby:
            raise LobbyNotFoundError(lobby_id=lobby_id)

        del self.lobbies[lobby_id]

        self._remove_user(lobby.host)
        if lobby.host_ws:
            await lobby.host_ws.close(code=status.WS_1000_NORMAL_CLOSURE)

        if lobby.guest:
            self._remove_user(lobby.guest)
        if lobby.guest_ws:
            await lobby.guest_ws.close(code=status.WS_1000_NORMAL_CLOSURE)

    async def create(self, host: api.UserProfile) -> api.LobbyId:
        if host.uuid in self.active_users:
            raise LobbyCreateError(user=host, existing_lobby_id=self.active_users[host.uuid])

        lobby_id = generate_lobby_id()
        while lobby_id in self.lobbies:
            lobby_id = generate_lobby_id()

        self.lobbies[lobby_id] = Lobby(
            self, lobby_id, host, api.LobbyOptions(is_public=True)
        )
        self._add_user(host, lobby_id)

        return lobby_id


lobby_manager = LobbyManager()


async def get_lobby(lobby_id: api.LobbyId) -> Lobby:
    out = await lobby_manager.get(lobby_id)
    if not out:
        raise LobbyNotFoundError(lobby_id=lobby_id)
    return out


LobbyDep = Annotated[Lobby, Depends(get_lobby)]


def create_lobby_factory(
    user: CurrentUserDep,
) -> Callable[[], Awaitable[api.LobbyProfile]]:
    async def f():
        lobby_id = await lobby_manager.create(user)

        out = await lobby_manager.get(lobby_id)
        if not out:
            # This case should never be reached because the lobby_manager.create
            # method already handles errors in lobby creation. If an error 
            # occurs  here, that means that the lboby was created, but not saved.
            raise Exception("Critical error in lobby dependency.")

        return out.to_profile()

    return f


CreateLobbyDep = Annotated[
    Callable[[], Awaitable[api.LobbyProfile]], Depends(create_lobby_factory)
]


async def get_user_lobby(user: CurrentUserDep) -> api.LobbyProfile | None:
    lobby_id: api.LobbyId | None = await lobby_manager.get_lobby_id_by_user_id(
        user.uuid
    )
    if not lobby_id:
        return None

    lobby: Lobby | None = await lobby_manager.get(lobby_id)
    if not lobby:
        raise Exception("Lobby should exist but doesnt")

    return lobby.to_profile()


UserLobbyDep = Annotated[api.LobbyProfile | None, Depends(get_user_lobby)]
