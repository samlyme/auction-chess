from fastapi import APIRouter, HTTPException, status

from app.dependencies.auth import CurrentUserDep
from app.dependencies.lobbies import LobbyDep

import app.schemas.types as api
from app.utils.exceptions import (
    IllegalMoveException,
    LobbyCreateError,
    LobbyJoinError,
    LobbyLeaveError,
    LobbyNotFoundError,
    LobbyPermissionError,
    LobbyStartError,
)

router = APIRouter(prefix="/lobbies")


# Once a lobby is created, the host must stay connected to the websocket
@router.post("")
async def create_lobby(
    user: CurrentUserDep, lobby_manager: LobbyDep
) -> api.LobbyProfile:
    try:
        lobby_id: api.LobbyId = await lobby_manager.create_lobby(user)
        return lobby_manager.to_profile(lobby_id)
    except LobbyCreateError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.detail)


@router.get("")
async def get_lobby_by_user_id(
    user: CurrentUserDep, lobby_manager: LobbyDep
) -> api.LobbyProfile | None:
    lobby_id = await lobby_manager.get_lobby_id_by_user_id(user.uuid)
    if lobby_id is None:
        return None

    return lobby_manager.to_profile(lobby_id)


@router.get("/{lobby_id}")
async def get_lobby(
    user: CurrentUserDep, lobby_manager: LobbyDep, lobby_id: api.LobbyId
) -> api.LobbyProfile:
    try:
        lobby = await lobby_manager.get_lobby(lobby_id)
        if lobby is None:
            raise LobbyNotFoundError(lobby_id)

        if user == lobby["host"] or user == lobby["guest"]:
            return lobby_manager.to_profile(lobby_id)

        if lobby["guest"] is None:
            return await join_lobby(user, lobby_manager, lobby_id)

        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    except LobbyNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.detail)


@router.post("/{lobby_id}/join")
async def join_lobby(
    user: CurrentUserDep, lobby_manager: LobbyDep, lobby_id: api.LobbyId
) -> api.LobbyProfile:
    try:
        await lobby_manager.join_lobby(user, lobby_id)
        return lobby_manager.to_profile(lobby_id)
    except (LobbyNotFoundError, LobbyJoinError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.detail)


@router.post("/{lobby_id}/start")
async def start_lobby(
    user: CurrentUserDep, lobby_manager: LobbyDep, lobby_id: api.LobbyId
) -> api.LobbyProfile:
    try:
        await lobby_manager.start(user, lobby_id)
        return lobby_manager.to_profile(lobby_id)
    except (LobbyPermissionError, LobbyStartError) as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.detail)


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
        await lobby_manager.delete_lobby(user, lobby_id)
    except LobbyNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.detail)
    except LobbyPermissionError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.detail)


@router.post("/{lobby_id}/move")
async def move(
    user: CurrentUserDep, lobby_manager: LobbyDep, lobby_id: api.LobbyId, move: api.Move
) -> None:
    try:
        await lobby_manager.make_move(lobby_id, user, move)
    except IllegalMoveException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)

@router.post("/{lobby_id}/bid")
async def bid(
    user: CurrentUserDep, lobby_manager: LobbyDep, lobby_id: api.LobbyId, bid: api.Bid
) -> None:
    try:
        await lobby_manager.make_bid(lobby_id, user, bid)
    except IllegalMoveException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
