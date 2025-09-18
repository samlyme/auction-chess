from fastapi import APIRouter, HTTPException, status

from app.dependencies.auth import CurrentUserDep
from app.dependencies.lobbies import CreateLobbyDep, LobbyDep, UserLobbyDep

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
async def create_lobby(dep: CreateLobbyDep) -> api.LobbyProfile:
    try:
        return await dep()
    except LobbyCreateError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.detail)


@router.get("")
async def get_lobby_by_user_id(lobby: UserLobbyDep) -> api.LobbyProfile | None:
    return lobby


@router.get("/{lobby_id}")
async def get_lobby(user: CurrentUserDep, lobby: LobbyDep) -> api.LobbyProfile:
    return lobby.to_profile()


@router.post("/{lobby_id}/join")
async def join_lobby(user: CurrentUserDep, lobby: LobbyDep) -> api.LobbyProfile:
    try:
        await lobby.join(user)
        return lobby.to_profile()
    # TODO: Refactor to use app-level exception handlers.
    except LobbyJoinError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.detail)


@router.post("/{lobby_id}/start")
async def start_lobby(user: CurrentUserDep, lobby: LobbyDep) -> api.LobbyProfile:
    try:
        await lobby.start(user)
        return lobby.to_profile()
    except (LobbyPermissionError, LobbyStartError) as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.detail)


@router.post("/{lobby_id}/leave")
async def leave_lobby(user: CurrentUserDep, lobby: LobbyDep) -> api.LobbyProfile:
    try:
        await lobby.leave(user)
        return lobby.to_profile()
    except LobbyLeaveError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.detail)


@router.delete("/{lobby_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lobby(user: CurrentUserDep, lobby: LobbyDep) -> None:
    try:
        await lobby.delete(user)
    except LobbyNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.detail)
    except LobbyPermissionError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.detail)


@router.post("/{lobby_id}/move")
async def move(user: CurrentUserDep, lobby_manager: LobbyDep, move: api.Move) -> None:
    try:
        await lobby_manager.make_move(user, move)
    except IllegalMoveException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.post("/{lobby_id}/bid")
async def bid(user: CurrentUserDep, lobby_manager: LobbyDep, bid: api.Bid) -> None:
    try:
        await lobby_manager.make_bid(user, bid)
    except IllegalMoveException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
