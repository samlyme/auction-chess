from typing import Callable, Literal

Color = Literal["w", "b"]
PieceType = Literal["p", "r", "n", "b", "q", "k"]
GamePhase = Literal["bid", "move"]

BoardPosition = tuple[int, int]
Move = tuple[BoardPosition, BoardPosition]

class Piece:
    type: PieceType
    color: Color
    hasMoved: bool = False  # Useful for castling, initial pawn moves

    def __init__(self, type: PieceType, color: Color, hasMoved: bool = False):
        self.type = type
        self.color = color
        self.hasMoved = hasMoved
        

# This is for "special" rules like en passent, promotion, and castling
MarkerTarget = Callable[[Piece], bool]
MarkerEffect = Callable[[], None]
class Marker:
    target: MarkerTarget
    effect: MarkerEffect

    def __init__(self, target: MarkerTarget, effect: MarkerEffect) -> None:
        self.target = target
        self.effect = effect

class Square:
    piece: Piece | None
    marker: Marker | None

    def __init__(self, piece: Piece | None = None, marker: Marker | None = None) -> None:
        self.piece = piece
        self.marker = marker

BoardState = list[list[Square]]
BoardFactory = Callable[[], BoardState]
def standard_board_factory() -> BoardState:
    board: BoardState = [[Square() for _ in range(8)] for _ in range(8)]

    piece_order: list[PieceType]= ["r", "n", "b", "q", "k", "b", "n", "r"]
    for index, piece in enumerate(piece_order):
        board[0][index].piece = Piece(type=piece, color="w", hasMoved=False)
        board[7][index].piece = Piece(type=piece, color="b", hasMoved=False)

    for i in range(8):
        board[1][i].piece = Piece(type="p", color="w", hasMoved=False)

    for i in range(8):
        board[6][i].piece = Piece(type="p", color="b", hasMoved=False)

    return board

class Board:
    board_state: BoardState
    rows: int
    cols: int

    def __init__(self, board_factory: BoardFactory = standard_board_factory) -> None:
        self.board_state = board_factory()
        self.rows = len(self.board_state)
        self.cols = len(self.board_state[0])

    def validate_position(self, position: BoardPosition):
        row, col = position
        if row < 0 or row >= self.rows or col < 0 or col >= self.cols:
            raise Exception("Invalid Position")
    
    def get(self, position: BoardPosition) -> Square:
        self.validate_position(position)

        row, col = position
        return self.board_state[row][col]
    
    def move(self, move: Move):
        start, end = move

        start_square: Square = self.get(start)
        piece: Piece | None = start_square.piece
        if not piece:
            raise Exception("Bad Move: start had no piece")
        end_square: Square = self.get(end)
        
        end_square.piece = start_square.piece
        start_square.piece = None

        marker: Marker | None = end_square.marker
        if marker and marker.target(piece):
            marker.effect()
            

        