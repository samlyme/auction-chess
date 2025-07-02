from app.core.auction_chess.rules.pieces import Bishop, King, Knight, Pawn, Queen, Rook
from app.core.auction_chess.types import BoardState, Piece, Position, Square
from app.schemas.types import Color, PieceType


def piece_factory(type: PieceType, color: Color, position: Position) -> Piece:
    if type == "p":
        return Pawn(color, position)
    elif type == "r":
        return Rook(color, position)
    elif type == "n":
        return Knight(color, position)
    elif type == "b":
        return Bishop(color, position)
    elif type == "q":
        return Queen(color, position)
    elif type == "k":
        return King(color, position)
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

    board[3][1].piece = piece_factory("p", "b", (3,1))
    return board