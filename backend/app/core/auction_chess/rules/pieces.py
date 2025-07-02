from typing import Iterable
from app.core.auction_chess.rules.effects import move_effect
from app.core.auction_chess.types import Board, BoardState, Move, Piece, Position
from app.schemas.types import Color


def sliding_moves(
    board_state: BoardState, color: Color, start: Position, direction: tuple[int, int]
):
    r, c = start
    dr, dc = direction
    nr, nc = r + dr, c + dc
    while nr < len(board_state) and nc < len(board_state[0]):
        square = board_state[nr][nc]
        if square.piece:
            if square.piece.color != color:
                yield Move(start, (nr, nc))
            break

        yield Move(start, (nr, nc))
        nr, nc = nr + dr, nc + dc

# TODO: rewrite using board.square_at()

class Pawn(Piece):
    def __init__(self, color: Color, position: Position, hasMoved: bool = False):
        super().__init__(color, "Pawn", "p", position, hasMoved)

    def moves(self, board: Board) -> Iterable[Move]:
        board_state = board.board_state
        dir: int = 1 if self.color == "w" else -1
        r, c = self.position

        nr, nc = r + dir, c
        if nr < len(board_state) and nc < len(board_state[0]):
            if not board_state[nr][nc].piece:
                yield Move(self.position, (nr, nc))

                nr, nc = r + dir * 2, c
                if (
                    not self.hasMoved
                    and nr < len(board_state)
                    and nc < len(board_state[0])
                ):
                    if not board_state[nr][nc]:
                        yield Move(self.position, (nr, nc))

        # Only these moves are considered attacking
        nr, nc = r + dir, c + 1
        if nr < len(board_state) and nc < len(board_state[0]):
            board_state[nr][nc].attacked_by.append(self)
            if board_state[nr][nc].piece:
                yield Move(self.position, (nr, nc))

        nr, nc = r + dir, c - 1
        if nr < len(board_state) and nc < len(board_state[0]):
            board_state[nr][nc].attacked_by.append(self)
            if board_state[nr][nc].piece:
                yield Move(self.position, (nr, nc))


class Rook(Piece):
    def __init__(self, color: Color, position: Position, hasMoved: bool = False):
        super().__init__(color, "Rook", "r", position, hasMoved)

    def moves(self, board: Board) -> Iterable[Move]:
        board_state = board.board_state
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        for direction in directions:
            for move in sliding_moves(
                board_state, self.color, self.position, direction
            ):
                square = board_state[move.end[0]][move.end[1]]
                square.attacked_by.append(self)
                yield move


class Knight(Piece):
    def __init__(self, color: Color, position: Position, hasMoved: bool = False):
        super().__init__(color, "Knight", "n", position, hasMoved)

    def moves(self, board: Board) -> Iterable[Move]:
        board_state = board.board_state
        r, c = self.position
        signs = [(1, 1), (1, -1), (-1, 1), (-1, -1)]
        long, short = 2, 1

        for sr, sc in signs:
            nr, nc = long * sr + r, short * sc + c
            if nr < len(board_state) and nc < len(board_state[0]):
                square = board_state[nr][nc]
                square.attacked_by.append(self)
                yield Move(self.position, (nr, nc))

            nr, nc = short * sr + r, long * sc + c
            if nr < len(board_state) and nc < len(board_state[0]):
                square = board_state[nr][nc]
                square.attacked_by.append(self)
                yield Move(self.position, (nr, nc))


class Bishop(Piece):
    def __init__(self, color: Color, position: Position, hasMoved: bool = False):
        super().__init__(color, "Bishop", "b", position, hasMoved)

    def moves(self, board: Board) -> Iterable[Move]:
        board_state = board.board_state
        directions = [(1, 1), (1, -1), (-1, 1), (-1, -1)]
        for direction in directions:
            for move in sliding_moves(
                board_state, self.color, self.position, direction
            ):
                square = board_state[move.end[0]][move.end[1]]
                square.attacked_by.append(self)
                yield move


class Queen(Piece):
    def __init__(self, color: Color, position: Position, hasMoved: bool = False):
        super().__init__(color, "Queen", "q", position, hasMoved)

    def moves(self, board: Board) -> Iterable[Move]:
        board_state = board.board_state
        directions = [
            (1, 0),
            (-1, 0),
            (0, 1),
            (0, -1),
            (1, 1),
            (1, -1),
            (-1, 1),
            (-1, -1),
        ]
        for direction in directions:
            for move in sliding_moves(
                board_state, self.color, self.position, direction
            ):
                square = board_state[move.end[0]][move.end[1]]
                square.attacked_by.append(self)
                yield move


class King(Piece):
    def __init__(self, color: Color, position: Position, hasMoved: bool = False):
        super().__init__(color, "King", "k", position, hasMoved)

    def moves(self, board: Board) -> Iterable[Move]:
        board_state = board.board_state
        directions = [
            (1, 0),
            (-1, 0),
            (0, 1),
            (0, -1),
            (1, 1),
            (1, -1),
            (-1, 1),
            (-1, -1),
        ]
        r, c = self.position
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if nr < len(board_state) and nc < len(board_state[0]):
                square = board_state[nr][nc]
                square.attacked_by.append(self)
                yield Move(self.position, (nr, nc))

        # TODO: implement castling

        if self.hasMoved:
            return

        square = board_state[r][c]
        if square.attacked_by:
            return

        # Long castle
        piece = board_state[r][0].piece
        if isinstance(piece, Rook) and not piece.hasMoved:
            if (
                not board_state[r][c - 1].attacked_by
                and board_state[r][c - 2].attacked_by
            ):
                yield Move(
                    start=self.position,
                    end=(r, c - 2),
                    effect=move_effect(board, Move((r, 0), (r, c - 1))),
                )

        # Short castle
        piece = board.square_at((r, 7)).piece
        if isinstance(piece, Rook) and not piece.hasMoved:
            if (
                not board_state[r][c + 1].attacked_by
                and board_state[r][c + 2].attacked_by
            ):
                yield Move(
                    start=self.position,
                    end=(r, c + 2),
                    effect=move_effect(board, Move((r, 7), (r, c + 1))),
                )
        