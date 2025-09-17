from typing import Annotated, Any, Awaitable, Callable
from uuid import UUID
from fastapi import Depends, WebSocket, status

from app.dependencies.auth import CurrentUserDep
from game.main import AuctionChess

import app.schemas.types as api
from app.utils.exceptions import LobbyCreateError, LobbyJoinError, LobbyLeaveError, LobbyNotFoundError, LobbyPermissionError, LobbyStartError
from app.utils.lobbies import game_factory, generate_lobby_id

class Lobby:
    """Recommended to use named function args"""
    def __init__(
        self,
        manager: "LobbyManager",
        id: api.LobbyId,
        host: api.UserProfile,
        # TODO: implement lobby_options
        lobby_options: Any,
        status: api.LobbyStatus = "pending",
        host_ws: WebSocket | None = None,
        guest: api.UserProfile | None = None,
        guest_ws: WebSocket | None = None,
        # TODO: Implement game options
        game_options: Any = None,
        game: AuctionChess | None = None
    ) -> None:
        self.manager: "LobbyManager" = manager
        self.id: api.LobbyId = id
        self.host: api.UserProfile = host
        self.is_public: Any = lobby_options

        self.status: api.LobbyStatus = status
        self.host_ws: WebSocket | None  = host_ws
        
        self.guest: api.UserProfile | None  = guest
        self.guest_ws: WebSocket | None = guest_ws

        
        self.game_options: None  = game_options

        self.game: AuctionChess | None = game
        
    async def delete(self, user: api.UserProfile) -> None:
        if user != self.host:
            raise LobbyPermissionError(user, self.id)

        await self.manager._delete(self.id)
    
    async def join(self, guest: api.UserProfile) -> None:
        if self.guest:
            raise LobbyJoinError(guest, self.id, "Lobby already full")
        
        self.guest = guest 
        self.manager._add_user(guest, self.id)

    async def leave(self, user: api.UserProfile) -> None:
        if user == self.host:
            raise LobbyLeaveError(user, self.id, "Host can not leave lobby.")
        
        if user != self.guest:
            raise LobbyLeaveError(user, self.id, "User is not guest of this lobby.")

        self.guest = None
        if self.guest_ws:
            await self.guest_ws.close(code=status.WS_1000_NORMAL_CLOSURE)

        self.manager._remove_user(user)

    async def start(self, user: api.UserProfile) -> None:
        if user != self.host:
            raise LobbyPermissionError(user, self.id)

        if not self.guest:
            raise LobbyStartError(user, self.id, "Lobby not full. Need guest.")

        self.game = game_factory(self.game_options)

    def to_profile(self) -> api.LobbyProfile:
        return api.LobbyProfile(
            id=self.id,
            status=self.status,
            host=self.host,
            guest=self.guest
        )

    async def set_websocket(self, websocket: WebSocket, user: api.UserProfile) -> None:
        if user == self.host:
            self.host_ws = websocket
        elif user == self.guest:
            self.guest_ws = websocket
        else:
            raise Exception(f"This user not in lobby {self.id}")
    
    async def remove_websocket(self, user: api.UserProfile) -> None:
        if user == self.host:
            self.host_ws = None
        elif user == self.guest:
            self.guest_ws = None
        else:
            raise Exception(f"This user not in lobby {self.id}")

    async def broadcast_lobby(self) -> None:
        packet: api.LobbyPacket = api.LobbyPacket(
            content=self.to_profile()
        )

        data = packet.json()
        if self.host_ws:
            await self.host_ws.send_text(data)
        if self.guest_ws:
            await self.guest_ws.send_text(data)
        
    async def broadcast_game(self):
        # TODO: implement game state serialization
        raise NotImplementedError()

    async def make_move(self, user: api.UserProfile, move: api.Move):
        if not self.game:
            raise Exception("Game not started")

        # TODO: implement player source validation
        self.game.push_uci(move.uci())
        await self.broadcast_game()
    
    async def make_bid(self, user: api.UserProfile, bid: api.Bid):
        if not self.game:
            raise Exception("Game not started")
        
        # TODO: implement player source validation
        self.game.push_bid(bid)
        await self.broadcast_game()
        


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
            raise Exception("_remove_user called with user that is not currently active.")
        del self.active_users[user.uuid]
            
    async def _delete(self, lobby_id: api.LobbyId):
        lobby = await self.get(lobby_id)
        if not lobby:
            raise LobbyNotFoundError(lobby_id)

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
            raise LobbyCreateError(
                user=host, 
                lobby_id=self.active_users[host.uuid]
            )

        lobby_id = generate_lobby_id()
        while lobby_id in self.lobbies:
            lobby_id = generate_lobby_id()


        self.lobbies[lobby_id] = Lobby(self, lobby_id, host, {"is_public": True})
        self._add_user(host, lobby_id)

        return lobby_id



lobby_manager = LobbyManager()

async def get_lobby(lobby_id: api.LobbyId) -> Lobby:
    out = await lobby_manager.get(lobby_id)
    if not out:
        raise LobbyNotFoundError(lobby_id)
    return out
LobbyDep = Annotated[Lobby, Depends(get_lobby)]

def create_lobby_factory(user: CurrentUserDep) -> Callable[[], Awaitable[api.LobbyProfile]]:
    async def f():
        lobby_id = await lobby_manager.create(user)

        out = await lobby_manager.get(lobby_id)
        if not out:
            raise LobbyCreateError(user, lobby_id)
        
        return out.to_profile()
    return f
CreateLobbyDep = Annotated[Callable[[], Awaitable[api.LobbyProfile]], Depends(create_lobby_factory)]

async def get_user_lobby(user: CurrentUserDep) -> api.LobbyProfile | None:
    lobby_id: api.LobbyId | None = await lobby_manager.get_lobby_id_by_user_id(user.uuid)
    if not lobby_id:
        return None

    lobby: Lobby | None = await lobby_manager.get(lobby_id)
    if not lobby:
        raise Exception("Lobby should exist but doesnt")

    return lobby.to_profile()
UserLobbyDep = Annotated[api.LobbyProfile | None, Depends(get_user_lobby)]