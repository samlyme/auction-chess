from typing import Iterable
from app.core.auction_chess.rules.effects import move_effect, place_en_passent_marker
from app.core.auction_chess.types import Board, Game, Move, Piece, Position, Square
from app.schemas.types import BoardPosition, Color
import app.schemas.types as api


def sliding_moves(
    board: Board, color: Color, start: Position, direction: tuple[int, int]
):
    r, c = start
    dr, dc = direction
    nr, nc = r + dr, c + dc
    while in_bounds(board, (nr,nc)):
        square = board.board_state[nr][nc]
        if square.piece:
            if square.piece.color != color:
                yield Move(start, (nr, nc))
            break

        yield Move(start, (nr, nc))
        nr, nc = nr + dr, nc + dc


def in_bounds(board: Board, position: Position) -> bool:
    try:
        board.validate_position(position)
        return True
    except Exception:
        return False


# TODO: rewrite using board.square_at()


class Pawn(Piece):
    def __init__(self, game: Game, color: Color, position: Position, hasMoved: bool = False):
        super().__init__(game, color, "Pawn", "p", position, hasMoved)

    def moves(self, board: Board) -> Iterable[Move]:
        board_state = board.board_state
        dir: int = 1 if self.color == "w" else -1
        r, c = self.position

        nr, nc = r + dir, c
        if in_bounds(board, (nr, nc)):
            if not board_state[nr][nc].piece:
                yield Move(self.position, (nr, nc))

                nr, nc = r + dir * 2, c
                if not self.hasMoved and in_bounds(board, (nr, nc)):
                    if not board_state[nr][nc].piece:
                        yield Move(
                            start=self.position,
                            end=(nr, nc),
                            effect=place_en_passent_marker(
                                game=self.game,
                                skipped=(r + dir, c),
                                end=(nr, nc),
                                color=self.color,
                            ),
                        )

        # Only these moves are considered attacking
        nr, nc = r + dir, c + 1
        if in_bounds(board, (nr, nc)):
            board_state[nr][nc].add_attacker(self)
            square: Square = board_state[nr][nc]
            piece: Piece | None = board_state[nr][nc].piece
            if (
                (piece is not None and piece.color != self.color)
                or square.marker and square.marker.target(self)
            ): 
                yield Move(self.position, (nr, nc))

        nr, nc = r + dir, c - 1
        if in_bounds(board, (nr, nc)):
            board_state[nr][nc].add_attacker(self)
            square: Square = board_state[nr][nc]
            piece: Piece | None = board_state[nr][nc].piece
            if (
                (piece is not None and piece.color != self.color)
                or square.marker and square.marker.target(self)
            ): 
                yield Move(self.position, (nr, nc))

    def public_piece(self) -> api.Piece:
        return api.Piece(type="p", color=self.color, has_moved=self.hasMoved)

class Rook(Piece):
    def __init__(self, game: Game, color: Color, position: Position, hasMoved: bool = False):
        super().__init__(game, color, "Rook", "r", position, hasMoved)

    def moves(self, board: Board) -> Iterable[Move]:
        board_state = board.board_state
        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        for direction in directions:
            for move in sliding_moves(
                board, self.color, self.position, direction
            ):
                square = board_state[move.end[0]][move.end[1]]
                square.add_attacker(self)
                yield move
    
    def public_piece(self) -> api.Piece:
        return api.Piece(type="r", color=self.color, has_moved=self.hasMoved)


class Knight(Piece):
    def __init__(self, game: Game, color: Color, position: Position, hasMoved: bool = False):
        super().__init__(game, color, "Knight", "n", position, hasMoved)

    def moves(self, board: Board) -> Iterable[Move]:
        board_state = board.board_state
        r, c = self.position
        signs = [(1, 1), (1, -1), (-1, 1), (-1, -1)]
        long, short = 2, 1

        for sr, sc in signs:
            nr, nc = long * sr + r, short * sc + c
            if in_bounds(board, (nr, nc)):
                square = board_state[nr][nc]
                square.add_attacker(self)
                piece: Piece | None = square.piece
                if not piece or piece.color != self.color:
                    yield Move(self.position, (nr, nc))

            nr, nc = short * sr + r, long * sc + c
            if in_bounds(board, (nr, nc)):
                square = board_state[nr][nc]
                square.add_attacker(self)
                piece: Piece | None = square.piece
                if not piece or piece.color != self.color:
                    yield Move(self.position, (nr, nc))

    def public_piece(self) -> api.Piece:
        return api.Piece(type="n", color=self.color, has_moved=self.hasMoved)


class Bishop(Piece):
    def __init__(self, game: Game, color: Color, position: Position, hasMoved: bool = False):
        super().__init__(game, color, "Bishop", "b", position, hasMoved)

    def moves(self, board: Board) -> Iterable[Move]:
        board_state = board.board_state
        directions = [(1, 1), (1, -1), (-1, 1), (-1, -1)]
        for direction in directions:
            for move in sliding_moves(
                board, self.color, self.position, direction
            ):
                square = board_state[move.end[0]][move.end[1]]
                square.add_attacker(self)
                yield move

    def public_piece(self) -> api.Piece:
        return api.Piece(type="b", color=self.color, has_moved=self.hasMoved)


class Queen(Piece):
    def __init__(self, game: Game, color: Color, position: Position, hasMoved: bool = False):
        super().__init__(game, color, "Queen", "q", position, hasMoved)

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
                board, self.color, self.position, direction
            ):
                square = board_state[move.end[0]][move.end[1]]
                square.add_attacker(self)
                yield move

    def public_piece(self) -> api.Piece:
        return api.Piece(type="q", color=self.color, has_moved=self.hasMoved)


class King(Piece):
    def __init__(self, game: Game, color: Color, position: Position, hasMoved: bool = False):
        super().__init__(game, color, "King", "k", position, hasMoved)

    def moves(self, board: Board) -> Iterable[Move]:
        print("🟢 calculating king moves")
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
            if in_bounds(board, (nr, nc)):
                square = board_state[nr][nc]
                square.add_attacker(self)
                piece: Piece | None = square.piece
                if not piece or piece.color != self.color:
                    yield Move(self.position, (nr, nc))

        # TODO: implement castling

        if self.hasMoved:
            return
        
        print("🟢 king has not moved")

        # TODO: Fix "attacked_by"
        square = board_state[r][c]
        if any(opp.color != self.color for opp in square.attacked_by):
            print("🔴 king", self.position, "is attacked by", square.attacked_by)
            return

        print("🟢 king is not in check")


        # TODO: Fix magic numbers
        # Long castle
        piece = board_state[r][0].piece
        if isinstance(piece, Rook) and not piece.hasMoved:
            print("🟢 rook has not moved")
            if (
                not any(board_state[r][col].piece for col in range(1, c))
            ):
                print("🟡 legal long castle, no pieces in the way")
                yield Move(
                    start=self.position,
                    end=(r, c - 2),
                    effect=move_effect(self.game, api.Move(
                        start=BoardPosition(row=r, col=0),
                        end=BoardPosition(row=r, col=c-1)
                    ))
                )

        # Short castle
        piece = board.square_at((r, 7)).piece
        if isinstance(piece, Rook) and not piece.hasMoved:
            print("🟢 rook has not moved")
            if (
                not any(board_state[r][ic].piece for ic in range(c+1, 7))
            ):
                print("🟡 legal short castle, no pieces in the way")
                yield Move(
                    start=self.position,
                    end=(r, c + 2),
                    effect=move_effect(self.game, api.Move(
                        start=BoardPosition(row=r, col=7),
                        end=BoardPosition(row=r, col=c+1)
                    ))
                )
                
    def public_piece(self) -> api.Piece:
        return api.Piece(type="k", color=self.color, has_moved=self.hasMoved)
