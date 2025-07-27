from typing import Annotated, Generator, Literal, TypedDict
from uuid import UUID
from fastapi import Depends, WebSocket, status
from app.core.auction_chess.game import Game

from app.core.auction_chess.game import AuctionChess
import app.schemas.types as api

class Lobby(TypedDict):
    status: api.LobbyStatus
    host: api.UserProfile
    host_ws: WebSocket | None
    guest: api.UserProfile | None
    guest_ws: WebSocket | None
    game: Game | None


# NOTE: In future, this should be in redis
class LobbyManager:
    lobbies: dict[api.LobbyId, Lobby]
    hosts: set[UUID]

    def __init__(self) -> None:
        self.lobbies = {}
        self.hosts = set()

    async def get(self, lobby_id: api.LobbyId) -> Lobby | None:
        return self.lobbies.get(lobby_id)

    async def create(self, host: api.UserProfile) -> api.LobbyId:
        if host.uuid in self.hosts:
            raise Exception("Player can not host multiple games")
        self.hosts.add(host.uuid)

        lobby_id = len(self.lobbies)
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
            raise Exception("This lobby does not exist")
        lobby = self.lobbies[lobby_id]

        if user != lobby["host"]:
            raise Exception("You are not the host of this lobby")

        self.hosts.remove(lobby["host"].uuid)

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

        del self.lobbies[lobby_id]

    async def join(self, lobby_id: api.LobbyId, guest: api.UserProfile):
        if lobby_id not in self.lobbies:
            raise Exception("This lobby does not exist")

        lobby = self.lobbies[lobby_id]

        if lobby["guest"] is not None:
            raise Exception("Lobby already full")

        if lobby["host"] == guest:
            raise Exception("Host can not join their own lobby as guest.")
        
        self.lobbies[lobby_id]["guest"] = guest

    # Assume that this method is called from a reputatble source
    async def start(self, host: api.UserProfile, lobby_id: api.LobbyId):
        if lobby_id not in self.lobbies:
            raise Exception("This lobby does not exist")

        lobby = self.lobbies[lobby_id]

        if lobby["status"] == "active":
            raise Exception("This lobby is already active")

        if lobby["host"] != host:
            raise Exception("You are not the host of this lobby")

        if not lobby["guest"]:
            raise Exception("This lobby is not full")
        
        lobby["status"] = "active"
        lobby["game"] = AuctionChess(
            white=lobby["host"].uuid,
            black=lobby["guest"].uuid
        )
    
    def to_profile(self, lobby_id: api.LobbyId):
        if lobby_id not in self.lobbies:
            raise Exception("This lobby does not exist")
        
        lobby = self.lobbies[lobby_id]

        return api.LobbyProfile(
            id=lobby_id,
            status=lobby["status"],
            host=lobby["host"],
            guest=lobby["guest"]
        )

    async def set_websocket(self, member: Literal["host", "guest"], lobby_id: api.LobbyId, websocket: WebSocket):
        if lobby_id not in self.lobbies:
            raise Exception("This lobby does not exist")
        lobby = self.lobbies[lobby_id]

        if member == "host":
            lobby["host_ws"] = websocket
        else:
            lobby["guest_ws"] = websocket

    async def remove_websocket(self, member: Literal["host", "guest"], lobby_id: api.LobbyId):
        lobby = self.lobbies[lobby_id]
        if member == "host":
            lobby["host_ws"] = None
        else:
            lobby["guest_ws"] = None

lobby_manager = LobbyManager()

def get_lobby_manager() -> Generator[LobbyManager]:
    yield lobby_manager

LobbyDep = Annotated[LobbyManager, Depends(get_lobby_manager)]