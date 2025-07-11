from uuid import uuid1

from app.core.auction_chess.board import ChessBoard
from app.core.auction_chess.rules.pieces import King
from app.core.auction_chess.types import Marker, Move, Position

# All the types defined here are for the interface between BE and FE
from app.core.auction_chess.rules.factories import en_passant_test_board_factory
from app.core.auction_chess.types import Game, Piece
from app.core.utils import PriorityQueue
import app.schemas.types as api


class AuctionChess(Game):
    phase: api.GamePhase = "bid"
    turn: api.Color = "w"
    players: dict[api.Color, api.Player] = {}

    # later for when we need to convert API sent moves to game logic moves
    moves: dict[Piece, list[Move]] = {}
    board: ChessBoard

    turns: int = 0
    marker_queue: PriorityQueue[Marker] = PriorityQueue()

    def __init__(self, white: api.Player, black: api.Player):
        self.players["w"] = white
        self.players["b"] = black
        # for testing
        self.board = ChessBoard(board_factory=en_passant_test_board_factory(self))
        for row in self.board.board_state:
            for square in row:
                if square.piece:
                    self.moves.setdefault(square.piece, [])

        self._update_all_moves()

    def add_marker(self, position: Position, marker: Marker, expires: int = -1):
        self.board.add_marker(position, marker)
        if expires != -1:
            self.marker_queue.push(expires + self.turns, marker)

    def move(self, move: api.Move) -> None:
        start: Position = (move.start.row, move.start.col)
        end: Position = (move.end.row, move.end.col)

        piece = self.board.piece_at(start)
        moves = self.moves[piece]

        game_move: Move | None = None
        for m in moves:
            if m.end == end:
                game_move = m
                break
        if not game_move:
            raise Exception("Bad move")

        captured: Piece | None = self.board.move(game_move)
        if captured:
            self._remove_piece(captured)

        self._increment_turn()
        self._update_all_moves()
    
    def capture(self, position: Position):
        try:
            piece = self.board.piece_at(position)
            self.board.square_at(position).piece = None
            self._remove_piece(piece)
        except Exception:
            pass

    # TODO: Optimize this
    def _update_all_moves(self):
        kings = []
        for piece in self.moves.keys():
            if isinstance(piece, King):
                kings.append(piece)
            else:
                self.moves[piece] = [move for move in piece.moves(self.board)]

        for king in kings:
            self.moves[king] = [move for move in king.moves(self.board)]

    def _remove_piece(self, piece: Piece):
        del self.moves[piece]

    def _increment_turn(self):
        print(self.marker_queue)
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
        out = ""
        for row in reversed(self.board.board_state):
            for square in row:
                piece = square.piece
                if piece:
                    out += (
                        piece.initial.upper() if piece.color == "w" else piece.initial
                    )
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
        print(test.moves)
        print("markers", test.marker_queue)
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
