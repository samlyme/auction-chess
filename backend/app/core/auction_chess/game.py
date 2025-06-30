from uuid import uuid1

from app.core.auction_chess.board import Board, Color, GamePhase, Move, Position
from app.core.auction_chess.rules import effects, en_passant_test_board_factory, pawn_double_move_effect, set_has_moved_effect

# All the types defined here are for the interface between BE and FE
import app.schemas.types as api

class Game:
    phase: GamePhase = "bid"
    turn: Color = "w"
    players: dict[Color, api.Player] = {}

    # later for when we need to convert API sent moves to game logic moves
    moves: dict[tuple[tuple[int, int], tuple[int, int]], Move] = {}
    board: Board

    def __init__(self, white: api.Player, black: api.Player):
        self.players["w"] = white
        self.players["b"] = black
        # for testing
        self.board = Board(board_factory=en_passant_test_board_factory)

        # Allow double move
        start: Position = (1, 0)
        skipped: Position = (2, 0)
        end: Position = (3, 0)
        self.moves[(start, end)] = Move(start=start, 
                                        end=end, 
                                        effect=effects(pawn_double_move_effect(self.board.square_at(skipped), 
                                                                                self.board.square_at(end), 
                                                                                "w"),
                                                       set_has_moved_effect(self.board.piece_at(start)))
                                        )

        # Allow taking en passant
        start: Position = (3, 1)
        end: Position = (2, 0)
        self.moves[(start, end)] = Move(start=start,
                                        end=end,
                                        effect=set_has_moved_effect(self.board.piece_at(start)))
        
        # self.moves = self._update_legal_moves()

    
    def public_board(self) -> api.GamePacket:
        board_pieces: api.BoardPieces = [[square.piece for square in row] for row in self.board.board_state] # type: ignore

        return api.GamePacket(board=board_pieces)
    
    def move(self, move: api.Move) -> None:
        start: Position = (move.start.row, move.start.col)
        end: Position = (move.end.row, move.end.col)

        game_move: Move = self.moves[(start, end)]
        self.board.move(game_move)
    
    def __repr__(self) -> str:
        board_pieces: api.BoardPieces = [[square.piece for square in row] for row in self.board.board_state] # type: ignore
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
    test: Game = Game(white=white, black=black)
    while True:
        print(test)
        sr = int(input("start row: "))
        sc = int(input("start col: "))
        er = int(input("end row: "))
        ec = int(input("end col: "))
        test.move(api.Move(start=api.BoardPosition(row=sr, col=sc), end=api.BoardPosition(row=er, col=ec)))
        