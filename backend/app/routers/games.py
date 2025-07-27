from fastapi import APIRouter

from app.dependencies.auth import CurrentUserDep
from app.dependencies.games import LobbyDep, LobbyId

router = APIRouter(prefix="/games")


# Once a lobby is created, the host must stay connected to the websocket
@router.post("/")
async def create_lobby(user: CurrentUserDep, lobby_manager: LobbyDep):
    lobby_id: LobbyId = await lobby_manager.create(user)
    return lobby_id


@router.post("/{lobby_id}/join")
async def join_lobby(user: CurrentUserDep, lobby_manager: LobbyDep, lobby_id: LobbyId):
    await lobby_manager.join(lobby_id, user)
    return "joined lobby"


@router.post("/{lobby_id}/start")
async def start_lobby(user: CurrentUserDep, lobby_manager: LobbyDep, lobby_id: LobbyId):
    await lobby_manager.start(user, lobby_id)
    return "started lobby"

@router.delete("/{lobby_id}")
async def delete_lobby(user: CurrentUserDep, lobby_manager: LobbyDep, lobby_id: LobbyId):
    await lobby_manager.delete(lobby_id)
    return "deleted lobby"