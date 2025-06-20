from typing import Annotated, Generator
from fastapi import Depends, WebSocket
from app.core.auction_chess import AuctionChess
from app.core.types import Game, Move

class InMemoryGameManager:
    def __init__(self):
        self.games : dict[int, tuple[AuctionChess, list[WebSocket]]]= {}

    async def connect(self, game_id: int, websocket: WebSocket):
        await websocket.accept()
        game, connections = self.games.setdefault(game_id, (AuctionChess(), []))

        await websocket.send_text(game.public_board().model_dump_json())
        connections.append(websocket)
        print("Connected to game", game_id)
    
    def disconnect(self, game_id: int, websocket: WebSocket):
        self.games[game_id][1].remove(websocket)
        print("Disconnected from game", game_id)

    async def move(self, game_id: int, move: Move):
        game, connections = self.games.setdefault(game_id, (AuctionChess(), []))
        game.move(move)
        print("Make move", move)
        
        board: Game = game.public_board()
        for connection in connections:
            await connection.send_text(board.model_dump_json())

games = InMemoryGameManager()

def get_games() -> Generator[InMemoryGameManager]:
    yield games

GamesDep = Annotated[InMemoryGameManager, Depends(get_games)]