from typing import Callable
from app.core.auction_chess.rules.pieces import Bishop, King, Knight, Pawn, Queen, Rook
from app.core.auction_chess.types import BoardFactory, BoardState, Game, Piece, Position, Square
from app.schemas.types import Color, PieceType


def peice_factory(game: Game) -> Callable[[PieceType, Color, Position, bool], Piece]:
    def f(type: PieceType, color: Color, position: Position, has_moved: bool = False) -> Piece:
        if type == "p":
            return Pawn(game, color, position, has_moved)
        elif type == "r":
            return Rook(game, color, position, has_moved)
        elif type == "n":
            return Knight(game, color, position, has_moved)
        elif type == "b":
            return Bishop(game, color, position, has_moved)
        elif type == "q":
            return Queen(game, color, position, has_moved)
        elif type == "k":
            return King(game, color, position, has_moved)
        else:
            raise Exception("Piece not defined")
    return f


def standard_board_factory(game: Game) -> BoardFactory:
    pf = peice_factory(game)

    def f():
        board: BoardState = [[Square() for _ in range(8)] for _ in range(8)]

        piece_order: list[PieceType] = ["r", "n", "b", "q", "k", "b", "n", "r"]
        for index, piece in enumerate(piece_order):
            board[0][index].piece = pf(piece, "w", (0, index), False)
            board[7][index].piece = pf(piece, "b", (7, index), False)

        for i in range(8):
            board[1][i].piece = pf("p", "w", (1, i), False)

        for i in range(8):
            board[6][i].piece = pf("p", "b", (6, i), False)

        return board
    return f


def en_passant_test_board_factory(game: Game) -> BoardFactory:
    pf = peice_factory(game)
    def f():
        board: BoardState = [[Square() for _ in range(8)] for _ in range(8)]
        board[1][0].piece = pf("p", "w", (1,0), False)

        board[3][1].piece = pf("p", "b", (3,1), True)
        board[3][2].piece = pf("p", "b", (3,2), True)
        return board
    return f