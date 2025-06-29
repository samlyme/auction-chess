import json
from uuid import uuid1

from app.schemas.types import Color, GamePacket, BoardPosition, BoardState, GamePhase, LegalMoves, Move, Piece, PieceType, Player

class Game:
    phase: GamePhase = "bid"
    turn: Color = "w"
    board: BoardState
    players: dict[Color, Player]
    moves: LegalMoves

    def __init__(self, white: Player, black: Player):
        self.players["w"] = white
        self.players["b"] = black
        self.board = self._initialize_board()
        # self.moves = self._update_legal_moves()

    def _initialize_board(self) -> BoardState:
        board: BoardState = [[None for _ in range(8)] for _ in range(8)]

        piece_order: list[PieceType]= ["r", "n", "b", "q", "k", "b", "n", "r"]
        for index, piece in enumerate(piece_order):
            board[0][index] = Piece(type=piece, color="w", hasMoved=False)
            board[7][index] = Piece(type=piece, color="b", hasMoved=False)

        for i in range(8):
            board[1][i] = Piece(type="p", color="w", hasMoved=False)

        for i in range(8):
            board[6][i] = Piece(type="p", color="b", hasMoved=False)

        return board


    def move(self, move: Move, player: Player):
        if player != self.players[self.turn]:
            raise Exception("Invalid turn")

        start = move.start 
        start_piece: Piece | None = self.board[start.row][start.col]
        if not start_piece:
            raise Exception("Invalid move")
        if start_piece.color != player.color:
            raise Exception("Invalid move")

        end = move.end
        end_piece: Piece | None = self.board[end.row][end.col]
        if end_piece and end_piece.color == player.color:
            raise Exception("Invalid move")
        

        p: Piece = self.board[start.row][start.col] # type: ignore
        self.board[end.row][end.col] = Piece(type=p.type, color=p.color, hasMoved=True)
        self.board[start.row][start.col] = None
        
    def validateMove(self) -> bool:
        # Add validation later
        return True

    def get_legal_moves(self) -> list[Move]:
        return []
    
    def get_board_state(self) -> str:
        serializable_board = []
        for row in self.board:
            serializable_row = []
            for piece in row:
                if piece:
                    # Use .model_dump() (Pydantic v2) or .dict() (Pydantic v1)
                    # to get the dictionary representation of the Piece model.
                    # Then recursively convert the inner Pydantic models (__root__ types).
                    piece_dict = piece.model_dump(mode='json') # `mode='json'` handles special types like Literal
                    serializable_row.append(piece_dict)
                else:
                    serializable_row.append(None)
            serializable_board.append(serializable_row)

        return json.dumps(serializable_board, indent=2) # indent for pretty printing
    
    def public_board(self) -> GamePacket:
        return GamePacket(board=self.board)
                    
    
if __name__ == "__main__":
    white=Player(color="w", uuid=uuid1())
    black=Player(color="b", uuid=uuid1())
    test: Game = Game(white=white, black=black)
    move: Move = Move(
        start=BoardPosition(row=0, col=0),
        end=BoardPosition(row=1, col=1)
    )
    # print(test.get_board_state())
    print(move.model_dump_json(indent=2))