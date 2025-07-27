
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.dependencies.auth import CurrentUserDep


router = APIRouter(prefix="/ws")

@router.websocket("/")
async def ws(websocket: WebSocket, user: CurrentUserDep):
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"{user}, {data}")
    except WebSocketDisconnect:
        print(f"Disconnected: {user}")
    await websocket.accept()