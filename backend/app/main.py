from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.core.auction_chess import Move
from app.dependencies.games import GamesDep
from app.routers import users
from app.dependencies.db import init_db
from app.routers import auth

app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(auth.router)

@app.on_event("startup")
def start_server():
    init_db()

@app.get("/")
async def get():
    return "hi"

@app.websocket("/game/{game_id}")
async def websocket_endpoint(games: GamesDep, websocket: WebSocket, game_id: int):
    await games.connect(game_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print("received", data)
            move: Move = Move.model_validate_json(data)
            try:
                await games.move(game_id, move)
            except ValueError as e:
                print(e)

    except WebSocketDisconnect:
        games.disconnect(game_id, websocket)