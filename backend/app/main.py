from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.core.auction_chess import AuctionChess, Move, PublicBoard

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

class GameManager:
    def __init__(self):
        self.games : dict[int, tuple[AuctionChess, list[WebSocket]]]= {}

    async def connect(self, game_id: int, websocket: WebSocket):
        await websocket.accept()
        game, connections = self.games.setdefault(game_id, (AuctionChess(), []))

        await websocket.send_json(game.public_board().model_dump_json())
        connections.append(websocket)
        print("Connected to game", game_id)
    
    def disconnect(self, game_id: int, websocket: WebSocket):
        self.games[game_id][1].remove(websocket)
        print("Disconnected from game", game_id)

    async def move(self, game_id: int, move: Move):
        game, connections = self.games.setdefault(game_id, (AuctionChess(), []))
        game.move(move)
        print("Make move", move)
        
        state: PublicBoard = game.public_board();
        for connection in connections:
            await connection.send_json(state.model_dump_json())
        
manager = GameManager()

@app.get("/")
async def get():
    return "hi"


@app.websocket("/game/{game_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: int):
    await manager.connect(game_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            move: Move = Move.model_validate_json(data)
            await manager.move(game_id, move)

    except WebSocketDisconnect:
        manager.disconnect(game_id, websocket)
    
    except ValidationError as e:
        print("Bad move")