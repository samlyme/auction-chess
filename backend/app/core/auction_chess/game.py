from uuid import uuid1

from app.core.auction_chess.board import Board, Color, GamePhase, Move
from app.schemas.types import BoardPieces, GamePacket, Player
# from app.schemas.types import Color, GamePacket, BoardPosition, BoardState, GamePhase, LegalMoves, Move, Piece, PieceType, Player

class Game:
    phase: GamePhase = "bid"
    turn: Color = "w"
    board: Board
    players: dict[Color, Player]

    def __init__(self, white: Player, black: Player):
        self.players["w"] = white
        self.players["b"] = black
        self.board = Board()
        # self.moves = self._update_legal_moves()

    
    def public_board(self) -> GamePacket:
        board_pieces: BoardPieces = [[square.piece for square in row] for row in self.board.board_state] # type: ignore

        return GamePacket(board=board_pieces)
                    
    
if __name__ == "__main__":
    white=Player(color="w", uuid=uuid1())
    black=Player(color="b", uuid=uuid1())
    test: Game = Game(white=white, black=black)
    move: Move = Move(
        start=(0, 0),
        end=(1, 1)
    )