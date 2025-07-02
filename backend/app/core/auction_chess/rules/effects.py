from app.core.auction_chess.rules.pieces import Pawn
from app.core.auction_chess.types import Board, Effect, Marker, MarkerTarget, Move, Piece, Square
from app.schemas.types import Color


def any_opposite_pawn(color: Color) -> MarkerTarget:
    def f(piece: Piece):
        return isinstance(piece, Pawn) and piece.color != color

    return f


def capture_effect(target: Square) -> Effect:
    def f():
        target.piece = None

    return f


def move_effect(board: Board, move: Move) -> Effect:
    def f():
        board.move(move)
    return f
    

# Puts a marker at the skipped square for en passent
def pawn_double_move_effect(skipped: Square, end: Square, color: Color) -> Effect:
    def f():
        skipped.marker = Marker(
            target=any_opposite_pawn(color), effect=capture_effect(end)
        )

    return f


def set_has_moved_effect(piece: Piece) -> Effect:
    def f():
        piece.hasMoved = True

    return f


def effects(*effects: Effect) -> Effect:
    def f():
        for effect in effects:
            effect()

    return f
