from app.core.auction_chess.rules.pieces import Bishop, King, Knight, Pawn, Queen, Rook
from app.core.auction_chess.types import BoardState, Piece, Position, Square
from app.schemas.types import Color, PieceType


def piece_factory(type: PieceType, color: Color, position: Position, has_moved: bool = False) -> Piece:
    if type == "p":
        return Pawn(color, position, has_moved)
    elif type == "r":
        return Rook(color, position, has_moved)
    elif type == "n":
        return Knight(color, position, has_moved)
    elif type == "b":
        return Bishop(color, position, has_moved)
    elif type == "q":
        return Queen(color, position, has_moved)
    elif type == "k":
        return King(color, position, has_moved)
    else:
        raise Exception("Piece not defined")


def standard_board_factory() -> BoardState:
    board: BoardState = [[Square() for _ in range(8)] for _ in range(8)]

    piece_order: list[PieceType] = ["r", "n", "b", "q", "k", "b", "n", "r"]
    for index, piece in enumerate(piece_order):
        board[0][index].piece = piece_factory(piece, "w", (0, index))
        board[7][index].piece = piece_factory(piece, "b", (7, index))

    for i in range(8):
        board[1][i].piece = piece_factory("p", "w", (1, i))

    for i in range(8):
        board[6][i].piece = piece_factory("p", "b", (6, i))

    return board


def en_passant_test_board_factory() -> BoardState:
    board: BoardState = [[Square() for _ in range(8)] for _ in range(8)]
    board[1][0].piece = piece_factory("p", "w", (1,0))

    board[3][1].piece = piece_factory("p", "b", (3,1), True)
    board[3][2].piece = piece_factory("p", "b", (3,1), True)
    return board