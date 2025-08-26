from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, status

from app.dependencies.auth import get_current_user
from app.dependencies.db import DBDep
from app.schemas.types import LobbyId



router = APIRouter(prefix="/ws")

@router.websocket("/lobbies/{lobby_id}")
async def ws(websocket: WebSocket, db: DBDep, lobby_id: LobbyId):
    """
    WebSockets will only be used to send info to the clients.
    The client will never send info to the server via the WebSocket.
    """
    print("🟡 found ws")
    # Jank to get around websocket funky business
    token = websocket.query_params.get("access_token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    try:
        user = await get_current_user(db, token)
    except HTTPException:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        await websocket.accept()
        await websocket.send_text(f"{user}, bruh")
    except WebSocketDisconnect:
        print(f"Disconnected: {user}")
    await websocket.accept()