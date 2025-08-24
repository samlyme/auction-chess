from typing import Annotated, Generator, TypedDict
from uuid import UUID
from fastapi import Depends, WebSocket, status
from app.core.auction_chess.game import Game

from app.core.auction_chess.game import AuctionChess
import app.schemas.types as api
from app.utils.exceptions import LobbyCreateError, LobbyJoinError, LobbyLeaveError, LobbyNotFoundError, LobbyPermissionError, LobbyStartError

class Lobby(TypedDict):
    status: api.LobbyStatus
    host: api.UserProfile
    host_ws: WebSocket | None
    guest: api.UserProfile | None
    guest_ws: WebSocket | None
    game: Game | None


# NOTE: In future, this should be in redis
class LobbyManager:
    def __init__(self) -> None:
        self.lobbies: dict[api.LobbyId, Lobby] = {}
        self.active_users: dict[UUID, api.LobbyId] = {}

    async def get(self, lobby_id: api.LobbyId) -> Lobby | None:
        return self.lobbies.get(lobby_id)
    
    async def get_lobby_id_by_user_id(self, user_id: UUID) -> api.LobbyId | None:
        return self.active_users.get(user_id)

    async def create(self, host: api.UserProfile) -> api.LobbyId:
        if host.uuid in self.active_users:
            raise LobbyCreateError(
                user=host, 
                lobby_id=self.active_users[host.uuid]
            )

        lobby_id = len(self.lobbies)

        self.active_users[host.uuid] = lobby_id
        self.lobbies[lobby_id] = {
            "status": "pending",
            "host": host,
            "host_ws": None,
            "guest": None,
            "guest_ws": None,
            "game": None
        }

        return lobby_id

    # Assume that this delete comes from a trusted source
    async def delete(self, user: api.UserProfile, lobby_id: api.LobbyId):
        if lobby_id not in self.lobbies:
            raise LobbyNotFoundError(lobby_id)
        lobby = self.lobbies[lobby_id]

        if user != lobby["host"]:
            raise LobbyPermissionError(user, lobby_id)

        if lobby["host_ws"]:
            try:
                await lobby["host_ws"].close(code=status.WS_1000_NORMAL_CLOSURE)
                print(f"Closed host WS for lobby {lobby_id}")
            except RuntimeError as e:
                print(f"Error closing host WS for lobby {lobby_id}: {e}")

        if lobby["guest_ws"]:
            try:
                await lobby["guest_ws"].close(code=status.WS_1000_NORMAL_CLOSURE)
                print(f"Closed guest WS for lobby {lobby_id}")
            except RuntimeError as e:
                print(f"Error closing host WS for lobby {lobby_id}: {e}")

        del self.active_users[lobby["host"].uuid]
        try:
            del self.active_users[lobby["guest"].uuid] # type: ignore
        except Exception:
            pass

        del self.lobbies[lobby_id]

    async def join(self, guest: api.UserProfile, lobby_id: api.LobbyId):
        if lobby_id not in self.lobbies:
            raise LobbyNotFoundError(lobby_id)

        lobby = self.lobbies[lobby_id]

        if guest == lobby["host"]:
            raise LobbyJoinError(guest, lobby_id, "host can't join own lobby")

        if guest.uuid in self.active_users:
            raise LobbyJoinError(guest, lobby_id, f"user already in Lobby '{self.active_users[guest.uuid]}'")

        if lobby["guest"] is not None:
            raise LobbyJoinError(guest, lobby_id, "lobby is full")
        
        self.active_users[guest.uuid] = lobby_id
        lobby["guest"] = guest

    async def leave(self, user: api.UserProfile, lobby_id: api.LobbyId):
        if lobby_id not in self.lobbies:
            raise LobbyNotFoundError(lobby_id)

        lobby = self.lobbies[lobby_id]

        if user.uuid not in self.active_users:
            raise LobbyLeaveError(
                user=user,
                lobby_id=lobby_id,
                reason="user not in any lobby"
            )
        
        if user != lobby["host"] and user != lobby["guest"]:
            raise LobbyLeaveError(
                user=user,
                lobby_id=lobby_id,
                reason="user not in this lobby"
            )
        
        if user == lobby["guest"]:
            lobby["guest"] = None
        elif user == lobby["host"]: # good redundancy
            if not lobby["guest"]:
                await self.delete(user, lobby_id)
            else:
                lobby["host"] = lobby["guest"]
                lobby["guest"] = None
        del self.active_users[user.uuid]

    # Assume that this method is called from a reputatble source
    async def start(self, user: api.UserProfile, lobby_id: api.LobbyId):
        if lobby_id not in self.lobbies:
            raise LobbyNotFoundError(lobby_id)

        lobby = self.lobbies[lobby_id]

        if lobby["host"] != user:
            raise LobbyPermissionError(user, lobby_id)

        if lobby["status"] == "active":
            raise LobbyStartError(user, lobby_id, "lobby already active")

        if not lobby["guest"]:
            raise LobbyStartError(user, lobby_id, "lobby not full")
        
        lobby["status"] = "active"
        lobby["game"] = AuctionChess(
            white=lobby["host"].uuid,
            black=lobby["guest"].uuid
        )
    
    def to_profile(self, lobby_id: api.LobbyId) -> api.LobbyProfile:
        if lobby_id not in self.lobbies:
            raise LobbyNotFoundError(lobby_id)
        
        lobby = self.lobbies[lobby_id]

        return api.LobbyProfile(
            id=lobby_id,
            status=lobby["status"],
            host=lobby["host"],
            guest=lobby["guest"]
        )

    # async def set_websocket(self, member: Literal["host", "guest"], lobby_id: api.LobbyId, websocket: WebSocket):
    #     if lobby_id not in self.lobbies:
    #         raise Exception("This lobby does not exist")
    #     lobby = self.lobbies[lobby_id]

    #     if member == "host":
    #         lobby["host_ws"] = websocket
    #     else:
    #         lobby["guest_ws"] = websocket

    # async def remove_websocket(self, member: Literal["host", "guest"], lobby_id: api.LobbyId):
    #     lobby = self.lobbies[lobby_id]
    #     if member == "host":
    #         lobby["host_ws"] = None
    #     else:
    #         lobby["guest_ws"] = None

lobby_manager = LobbyManager()

def get_lobby_manager() -> Generator[LobbyManager]:
    yield lobby_manager

LobbyDep = Annotated[LobbyManager, Depends(get_lobby_manager)]