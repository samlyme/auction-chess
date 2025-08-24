from fastapi import APIRouter, HTTPException, status

from app.dependencies.auth import AuthDep, CurrentUserDep
from app.dependencies.lobbies import LobbyDep

import app.schemas.types as api
from app.utils.exceptions import (
    LobbyCreateError,
    LobbyJoinError,
    LobbyLeaveError,
    LobbyNotFoundError,
    LobbyPermissionError,
)

router = APIRouter(prefix="/lobbies")


# Once a lobby is created, the host must stay connected to the websocket
@router.post("")
async def create_lobby(
    user: CurrentUserDep, lobby_manager: LobbyDep
) -> api.LobbyProfile:
    try:
        lobby_id: api.LobbyId = await lobby_manager.create(user)
        return lobby_manager.to_profile(lobby_id)
    except LobbyCreateError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.detail)


@router.get("")
async def get_lobby_id_by_user_id(user: CurrentUserDep, lobby_manager: LobbyDep) -> api.LobbyId | None:
    return await lobby_manager.get_lobby_id_by_user_id(user.uuid)


@router.get("/{lobby_id}")
async def get_lobby(
    _: AuthDep, lobby_manger: LobbyDep, lobby_id: api.LobbyId
) -> api.LobbyProfile:
    try:
        return lobby_manger.to_profile(lobby_id)
    except LobbyNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.detail)


@router.post("/{lobby_id}/join")
async def join_lobby(
    user: CurrentUserDep, lobby_manager: LobbyDep, lobby_id: api.LobbyId
) -> api.LobbyProfile:
    try:
        await lobby_manager.join(user, lobby_id)
        return lobby_manager.to_profile(lobby_id)
    except (LobbyNotFoundError, LobbyJoinError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.detail)


# TODO: implement lobby start errors
@router.post("/{lobby_id}/start")
async def start_lobby(
    user: CurrentUserDep, lobby_manager: LobbyDep, lobby_id: api.LobbyId
) -> api.LobbyProfile:
    try:
        await lobby_manager.start(user, lobby_id)
        return lobby_manager.to_profile(lobby_id)
    except LobbyPermissionError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.detail)

# TODO: implement lobby leave
@router.post("/{lobby_id}/leave")
async def leave_lobby(
    user: CurrentUserDep, lobby_manager: LobbyDep, lobby_id: api.LobbyId
) -> api.LobbyProfile:
    try:
        await lobby_manager.leave(user, lobby_id)
        return lobby_manager.to_profile(lobby_id)
    except LobbyLeaveError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.detail)


@router.delete("/{lobby_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lobby(
    user: CurrentUserDep, lobby_manager: LobbyDep, lobby_id: api.LobbyId
) -> None:
    try:
        await lobby_manager.delete(user, lobby_id)
    except LobbyNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.detail)
    except LobbyPermissionError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.detail)
