from collections import defaultdict
import datetime
from uuid import UUID, uuid1

from app.core.auction_chess.board import ChessBoard
from app.core.auction_chess.types import Color, GamePhase, Marker, Move, Piece, Position

# All the types defined here are for the interface between BE and FE
from app.core.auction_chess.rules.factories import standard_board_factory
from app.core.auction_chess.types import Game
from app.core.utils import PriorityQueue

import app.schemas.types as api
from app.utils.exceptions import IllegalMoveException


class AuctionChess(Game):
    phase: GamePhase = "move"
    turn: Color = "w"
    players: dict[Color, UUID] = {}

    board: ChessBoard
    moves: dict[Position, list[Move]]

    turns: int = 0
    marker_queue: PriorityQueue[Marker] = PriorityQueue()

    def __init__(self, white: UUID, black: UUID):
        self.players["w"] = white
        self.players["b"] = black
        # for testing
        self.board = ChessBoard(board_factory=standard_board_factory(self))
        self.moves = defaultdict(list)

        self._update_all_moves()

    def add_marker(self, position: Position, marker: Marker, expires: int = -1):
        """
        Places a marker down at the specified position. If "expires" is set to 
        -1, the marker doesn't expire.
        """
        self.board.add_marker(position, marker)
        if expires != -1:
            self.marker_queue.push(expires + self.turns, marker)

    def user_move(self, user: api.UserProfile, move: api.Move) -> None:
        """
        Executes a standard move from client.
        """
        if self.phase == "bid":
            raise IllegalMoveException("Can't make moves during bid phase.")
        
        if self.players[self.turn] != user.uuid:
            raise IllegalMoveException("Not your move turn.")
        
        parsed_move = Move(
            start=(move.start.row, move.start.col),
            end=(move.end.row, move.end.col)
        )
        
        square = self.board.square_at(parsed_move.start)
        if not square.piece:
            raise IllegalMoveException("Invalid move. No piece at start.")
        
        if square.piece.color != self.turn:
            raise IllegalMoveException("Invalid move. Not your piece.")

        moves = self.moves[parsed_move.start]

        # TODO: implement move validation
        game_move = None
        for m in moves:
            if m.end == parsed_move.end:
                game_move = m
                break
        if not game_move:
            raise IllegalMoveException("Invalid move. Illegal move")


        self.board.move(game_move)

        self._increment_turn()
        self._update_all_moves()

    def move(self, move: api.Move) -> None:
        """
        This move is for internal moves like castling.
        """
        parsed_move = Move(
            start=(move.start.row, move.start.col),
            end=(move.end.row, move.end.col)
        )

        self.board.move(parsed_move)
    
    def capture(self, position: Position):
        """
        Captures a piece without question. Only really used for en passent.
        """
        try:
            self.board.square_at(position).piece = None
        except Exception:
            pass

    def public_board(self) -> api.BoardPieces:
        board_pieces: api.BoardPieces = [
            [square.piece.public_piece() if square.piece else None for square in row] for row in self.board.board_state
        ] 

        return board_pieces
    
    def public_moves(self) -> api.LegalMoves:
        moves: api.LegalMoves = [
            [ []                  # start with an empty list of moves
            for _ in row ]      # one per column in this board‐row
            for row in self.board.board_state      # one list-of-lists per board‐row
        ]
        for row in range(self.board.rows):
            for col in range(self.board.cols):
                moves[row][col] += [api.BoardPosition(row=move.end[0], col=move.end[1]) for move in self.moves[(row, col)]]
        return moves

    # TODO: Optimize this
    def _update_all_moves(self):
        print("🟢 updating moves")
        kings: list[Piece] = []
        for row in range(self.board.rows):
            for col in range(self.board.cols):
                try:
                    piece = self.board.piece_at((row, col))
                    piece.update_position((row, col))
                    if piece.initial == "k":
                        kings.append(piece)
                    else:
                        self.moves[(row, col)] = list(piece.moves(self.board))
                except Exception:
                    self.moves[(row,col)].clear()
        
        # must do kings last for castling to work
        for king in kings:
            self.moves[king.position] = list(king.moves(self.board))
                

    def _increment_turn(self):
        # TODO: change the turn to be based on bid
        if self.turn == "b":
            self.turn = "w"
        else:
            self.turn = "b"

        while (
            not self.marker_queue.is_empty()
            and self.marker_queue.peek()[0] <= self.turns
        ):
            _, marker = self.marker_queue.pop()
            # Work around to disable a marker
            marker.effect = lambda: None
            marker.target = lambda _: False
        self.turns += 1

    def __repr__(self) -> str:
        out = ""
        for row in range(self.board.rows):
            for col in range(self.board.cols):
                try:
                    piece = self.board.piece_at((row, col))
                    out += piece.initial + str(self.moves[(row, col)]) + "\n"
                except Exception:
                    pass

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
    white = api.UserProfile(uuid=uuid1(), username="sam", created_at=datetime.datetime.now())
    black = api.UserProfile(uuid=uuid1(), username="bob", created_at=datetime.datetime.now())
    test: Game = AuctionChess(white=white.uuid, black=black.uuid)
    while True:
        print(test)
        # print(test.moves)
        # print("markers", test.marker_queue)
        sr = int(input("start row: "))
        sc = int(input("start col: "))
        er = int(input("end row: "))
        ec = int(input("end col: "))
        
        if test.turn == "w":
            test.user_move(white, api.Move(start=api.BoardPosition(row=sr, col=sc), end=api.BoardPosition(row=er, col=ec)))
        else:
            test.user_move(black, api.Move(start=api.BoardPosition(row=sr, col=sc), end=api.BoardPosition(row=er, col=ec)))