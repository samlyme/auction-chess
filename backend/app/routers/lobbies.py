from fastapi import APIRouter, status

from app.dependencies.auth import AuthDep, CurrentUserDep
from app.dependencies.games import LobbyDep

import app.schemas.types as api
router = APIRouter(prefix="/lobbies")


# Once a lobby is created, the host must stay connected to the websocket
@router.post("/")
async def create_lobby(user: CurrentUserDep, lobby_manager: LobbyDep) -> api.LobbyProfile:
    lobby_id: api.LobbyId = await lobby_manager.create(user)
    return lobby_manager.to_profile(lobby_id)


@router.post("/{lobby_id}/join")
async def join_lobby(user: CurrentUserDep, lobby_manager: LobbyDep, lobby_id: api.LobbyId) -> api.LobbyProfile:
    await lobby_manager.join(lobby_id, user)
    return lobby_manager.to_profile(lobby_id)


@router.post("/{lobby_id}/start")
async def start_lobby(user: CurrentUserDep, lobby_manager: LobbyDep, lobby_id: api.LobbyId) -> api.LobbyProfile:
    await lobby_manager.start(user, lobby_id)
    return lobby_manager.to_profile(lobby_id)


@router.get("/{lobby_id}")
async def get_lobby(_: AuthDep, lobby_manger: LobbyDep, lobby_id: api.LobbyId) -> api.LobbyProfile:
    return lobby_manger.to_profile(lobby_id)


@router.delete(
    "/{lobby_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_lobby(user: CurrentUserDep, lobby_manager: LobbyDep, lobby_id: api.LobbyId) -> None:
    await lobby_manager.delete(user, lobby_id)