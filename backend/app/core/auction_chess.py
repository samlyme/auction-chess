import json

from app.core.types import Game, BoardPosition, BoardState, Move, Piece, Piece, PieceType, PieceType

class AuctionChess:
    board: BoardState

    def __init__(self):
        self.board = self._initialize_board()

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

    def move(self, move: Move):
        start = move.start 
        end = move.end
        if not self.board[start.row][start.col]:
            raise ValueError("Start has no piece.")

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
    
    def public_board(self) -> Game:
        return Game(board=self.board)
                    
    
if __name__ == "__main__":
    test: AuctionChess = AuctionChess()
    move: Move = Move(
        start=BoardPosition(row=0, col=0),
        end=BoardPosition(row=1, col=1)
    )
    # print(test.get_board_state())
    print(move.model_dump_json(indent=2))