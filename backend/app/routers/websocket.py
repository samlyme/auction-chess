from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, status

from app.dependencies.auth import get_current_user
from app.dependencies.db import DBDep
from app.dependencies.lobbies import LobbyDep
from app.schemas.types import LobbyId, UserProfile



router = APIRouter(prefix="/ws")

@router.websocket("/lobbies/{lobby_id}")
async def ws(websocket: WebSocket, db: DBDep, lobby_manager: LobbyDep, lobby_id: LobbyId):
    """
    WebSockets will only be used to send info to the clients.
    The client will never send info to the server via the WebSocket.
    """

    # TODO: Extract to dependency
    token = websocket.query_params.get("access_token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    try:
        user: UserProfile = await get_current_user(db, token)
    except HTTPException:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return


    # Jank because we need to not return. Otherwise AGSI will send an implicit close.
    try:
        await websocket.accept()
        await lobby_manager.set_websocket(lobby_id, websocket, user)
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await lobby_manager.remove_websocket(lobby_id, user)