from uuid import uuid1

from app.core.auction_chess.board import Board, Marker, Move, Position
from app.core.auction_chess.game import Game
from app.core.auction_chess.rules.effects import (
    effects,
    pawn_double_move_effect,
    set_has_moved_effect,
)

# All the types defined here are for the interface between BE and FE
from app.core.auction_chess.rules.factories import en_passant_test_board_factory
from app.core.utils import PriorityQueue
import app.schemas.types as api


class AuctionChess(Game):
    phase: api.GamePhase = "bid"
    turn: api.Color = "w"
    players: dict[api.Color, api.Player] = {}

    # later for when we need to convert API sent moves to game logic moves
    moves: dict[tuple[tuple[int, int], tuple[int, int]], Move] = {}
    board: Board

    turns: int = 0
    marker_queue: PriorityQueue[Marker] = PriorityQueue()

    def __init__(self, white: api.Player, black: api.Player):
        self.players["w"] = white
        self.players["b"] = black
        # for testing
        self.board = Board(board_factory=en_passant_test_board_factory)

        # Allow double move
        start: Position = (1, 0)
        skipped: Position = (2, 0)
        end: Position = (3, 0)
        self.moves[(start, end)] = Move(
            start=start,
            end=end,
            effect=effects(
                pawn_double_move_effect(
                    self.board.square_at(skipped), self.board.square_at(end), "w"
                ),
                set_has_moved_effect(self.board.piece_at(start)),
            ),
        )

        # Allow taking en passant
        start: Position = (3, 1)
        end: Position = (2, 0)
        self.moves[(start, end)] = Move(
            start=start,
            end=end,
            effect=set_has_moved_effect(self.board.piece_at(start)),
        )

    def add_marker(self, position: Position, marker: Marker, expires: int = -1):
        self.board.add_marker(position, marker)
        if expires != -1:
            self.marker_queue.push(expires + self.turns, marker)

    def move(self, move: api.Move) -> None:
        start: Position = (move.start.row, move.start.col)
        end: Position = (move.end.row, move.end.col)

        game_move: Move = self.moves[(start, end)]
        self.board.move(game_move)
        self._increment_turn()

    def _increment_turn(self):
        while (
            not self.marker_queue.is_empty()
            and self.marker_queue.peek()[0] <= self.turns
        ):
            _, marker = self.marker_queue.pop()
            # Work around to disable a marker
            marker.effect = lambda: None
            marker.target = lambda _: False
        self.turns += 1

    def public_board(self) -> api.GamePacket:
        board_pieces: api.BoardPieces = [
            [square.piece for square in row] for row in self.board.board_state
        ]  # type: ignore

        return api.GamePacket(board=board_pieces)

    def __repr__(self) -> str:
        board_pieces: api.BoardPieces = [
            [square.piece for square in row] for row in self.board.board_state
        ]  # type: ignore
        out = ""
        for row in reversed(board_pieces):
            for col in row:
                if col:
                    out += col.type.upper() if col.color == "w" else col.type
                else:
                    out += "-"
                out += " "
            out += "\n"
        return out


if __name__ == "__main__":
    white = api.Player(color="w", uuid=uuid1())
    black = api.Player(color="b", uuid=uuid1())
    test: Game = AuctionChess(white=white, black=black)
    while True:
        print(test)
        sr = int(input("start row: "))
        sc = int(input("start col: "))
        er = int(input("end row: "))
        ec = int(input("end col: "))
        test.move(
            api.Move(
                start=api.BoardPosition(row=sr, col=sc),
                end=api.BoardPosition(row=er, col=ec),
            )
        )
