from typing import Iterable

from app.core.auction_chess.types import (
    Board,
    BoardFactory,
    BoardState,
    Marker,
    Move,
    Piece,
    Position,
    Square,
)


class ChessBoard(Board):
    board_state: BoardState
    rows: int
    cols: int

    def __init__(
        self,
        board_factory: BoardFactory,
        markers: Iterable[tuple[Position, Marker]] = [],
    ) -> None:
        self.board_state = board_factory()
        self.rows = len(self.board_state)
        self.cols = len(self.board_state[0])

        for pos, marker in markers:
            self.add_marker(pos, marker)

    def square_at(self, position: Position) -> Square:
        self.validate_position(position)
        return self.board_state[position[0]][position[1]]

    def piece_at(self, position: Position) -> Piece:
        square = self.square_at(position)
        if not square.piece:
            raise Exception("No piece there.")
        return square.piece

    def add_marker(self, position: Position, marker: Marker) -> None:
        self.square_at(position).marker = marker

    def remove_marker(self, position: Position) -> None:
        self.square_at(position).marker = None

    def validate_position(self, position: Position) -> None:
        row, col = position
        if row < 0 or row >= self.rows or col < 0 or col >= self.cols:
            raise Exception("Invalid Position")

    def move(self, move: Move) -> Piece | None:
        start, end = move.start, move.end

        start_square: Square = self.square_at(start)
        piece: Piece | None = start_square.piece
        if not piece:
            raise Exception("Bad Move: start had no piece")
        end_square: Square = self.square_at(end)
        captured: Piece | None = end_square.piece

        end_square.piece = piece
        start_square.piece = None

        piece.update_position(end)

        # ALL MOVE EFFECTS HAPPEN AFTER THE BOARD MOVES
        move.effect()

        marker: Marker | None = end_square.marker
        if marker and marker.target(piece):
            marker.effect()

        return captured
