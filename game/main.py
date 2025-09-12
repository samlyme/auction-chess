from typing import Literal
import chess


class AuctionChess(chess.Board):
    def __init__(self, fen: str | None = None, *, chess960: bool = False) -> None:
        super().__init__(fen, chess960=chess960)
        self.balances: dict[chess.Color, int] = {
            chess.WHITE: 1000,
            chess.BLACK: 1000,
        }

        self.phase: Literal["bid", "move"] = "bid"

    def push(self, move: chess.Move) -> None:
        if self.phase != "move":
            raise chess.IllegalMoveError("Can't make moves in bid phase.")

        return super().push(move)

    def is_legal(self, move: chess.Move) -> bool:
        return not self.is_variant_end() and self.is_pseudo_legal(move)

    def is_variant_win(self) -> bool:
        return not self.king(not self.turn)

    def is_variant_loss(self) -> bool:
        return not self.king(self.turn)

    def is_variant_draw(self) -> bool:
        return self.balances[chess.WHITE] == 0 and self.balances[chess.BLACK] == 0

    def outcome(self, *, claim_draw: bool = False) -> chess.Outcome | None:
        if self.is_variant_loss():
            return chess.Outcome(chess.Termination.VARIANT_LOSS, not self.turn)
        if self.is_variant_win():
            return chess.Outcome(chess.Termination.VARIANT_WIN, self.turn)
        if self.is_variant_draw():
            return chess.Outcome(chess.Termination.VARIANT_DRAW, None)


board = AuctionChess(fen="rnb1kbnr/ppp2ppp/4q3/8/8/8/PPPP4/RNBQ1K1R w KQkq - 0 1")
print(board)
while True:
    board.push_uci(input("Enter move: "))
    print(board)

# moves = ["e2e4", "e7e5", "d1h5", "f7f5"]

# for move in moves:
#     board.push_uci(move)
#     print(board)
