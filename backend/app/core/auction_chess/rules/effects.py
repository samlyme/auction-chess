from app.core.auction_chess.types import Board, Effect, Game, Marker, MarkerTarget, Move, Piece, Position, Square
import app.schemas.types as api
from app.schemas.types import Color


def any_opposite_pawn(color: Color) -> MarkerTarget:
    def f(piece: Piece):
        # TODO: workaround with isinstance somehow avoiding circular imports
        return piece.initial == "p" and piece.color != color

    return f


def capture_effect(game: Game, position: Position) -> Effect:
    def f():
        game.capture(position)
    return f


def move_effect(game: Game, move: api.Move) -> Effect:
    def f():
        game.move(move)
    return f
    

# Puts a marker at the skipped square for en passent
# TODO: make this take in a game object so the game can properly manage the marker
def place_en_passent_marker(game: Game, skipped: Position, end: Position, color: Color) -> Effect:
    def f():
        game.add_marker(
            position=skipped, 
            marker=Marker(
                target=any_opposite_pawn(color), 
                effect=capture_effect(game, end)
            ), 
            expires=1
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
