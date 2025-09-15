from abc import ABC, abstractmethod
from typing import Iterator, Literal
import chess
from chess import BB_ALL, Bitboard, Move, Outcome, Termination


class PseudoChess(chess.Board):
    """
    This class provides a stripped back variant of chess where pseudo-legal moves
    are legal, and there is no checkmate. You have to capture the king to win.
    """

    def __init__(self, fen: str | None = None, *, chess960: bool = False) -> None:
        super().__init__(fen, chess960=chess960)

    """
    Override all the legality checks.
    """

    def is_legal(self, move: chess.Move) -> bool:
        return self.is_pseudo_legal(move)

    def has_legal_en_passant(self) -> bool:
        return self.has_pseudo_legal_en_passant()

    def generate_legal_moves(
        self, from_mask: Bitboard = BB_ALL, to_mask: Bitboard = BB_ALL
    ) -> Iterator[Move]:
        if self.is_variant_end():
            return
        yield from self.generate_pseudo_legal_moves(from_mask, to_mask)

    # NOTE: "checkmate" logic is hard because i want to implement contracts down the line.
    def is_variant_win(self) -> bool:
        return not self.king(not self.turn)

    def is_variant_loss(self) -> bool:
        return not self.king(self.turn)

    def is_variant_draw(self) -> bool:
        # in this variant, it is logically impossible to draw
        return False

    def outcome(self, *, claim_draw: bool = False) -> chess.Outcome | None:
        if self.is_variant_loss():
            return chess.Outcome(chess.Termination.VARIANT_LOSS, not self.turn)
        if self.is_variant_win():
            return chess.Outcome(chess.Termination.VARIANT_WIN, self.turn)
        if self.is_variant_draw():
            return chess.Outcome(chess.Termination.VARIANT_DRAW, None)

        if claim_draw:
            if self.can_claim_fifty_moves():
                return Outcome(Termination.FIFTY_MOVES, None)
            if self.can_claim_threefold_repetition():
                return Outcome(Termination.THREEFOLD_REPETITION, None)

        return None


class Bid:
    amount: int
    fold: bool
    player: chess.Color

    def __init__(self, amount: int, fold: bool, player: chess.Color) -> None:
        self.amount = amount
        self.fold = fold
        self.player = player


AuctionStyle = Literal[
    "open_first",
    "open_second",
    "closed_first",
    "closed_second",
    "open-all",
    "closed-all",
]

GamePhase = Literal["move", "bid"]


class AuctionChess(PseudoChess, ABC):
    style: AuctionStyle

    def __init__(self, fen: str | None = None, *, chess960: bool = False) -> None:
        super().__init__(fen, chess960=chess960)

        self.phase: GamePhase = "bid"
        self.balances: dict[chess.Color, int] = {
            chess.WHITE: 1000,
            chess.BLACK: 1000,
        }

    @abstractmethod
    def push_bid(self, bid: Bid) -> None:
        pass

    def push(self, move: Move) -> None:
        super().push(move)
        self.phase = "move" if self.phase == "bid" else "bid"

    def is_variant_draw(self) -> bool:
        return self.balances[chess.WHITE] == 0 and self.balances[chess.BLACK] == 0


class OpenFirstAuctionChess(AuctionChess):
    style: AuctionStyle = "open_first"

    def __init__(self, fen: str | None = None, *, chess960: bool = False) -> None:
        super().__init__(fen, chess960=chess960)

        self.phase = "bid"

        self.bid_history: list[list[Bid]] = [[]]
        self.bid_turn: chess.Color = chess.WHITE

    def push_bid(self, bid: Bid) -> None:
        if self.phase != "bid":
            raise chess.IllegalMoveError("Can't make bids during move phase.")

        if bid.player != self.bid_turn:
            raise chess.IllegalMoveError("Not your bidding turn.")

        if bid.amount > self.balances[bid.player]:
            raise chess.IllegalMoveError("Can't bid more than your balance.")

        bid_stack: list[Bid] = self.bid_history[-1]
        if bid.fold:
            # TODO: Implement a method to cleanly transition from bid to move phase.
            # Initiate move phase for opponent.
            self.phase = "move"
            self.bid_history.append([])

            self.turn = not bid.player
            self.balances[not bid.player] -= bid_stack[-1].amount

            # NOTE: The player who folds starts the next bid so we do not swap self.bid_turn
            bid_stack.append(bid)
            return

        if bid_stack and bid.amount <= bid_stack[-1].amount:
            # TODO: Implement minimum raise amount
            raise chess.IllegalMoveError("Bids must raise price.")

        if bid.amount >= self.balances[not bid.player]:
            self.phase = "move"
            self.bid_history.append([])
            self.turn = bid.player
            self.balances[bid.player] -= bid.amount
            bid_stack.append(bid)
            return

        bid_stack.append(bid)
        self.bid_turn = not self.bid_turn

    def __str__(self) -> str:
        phase = f"PHASE: {self.phase}"
        turn = f"TURN: {'w' if self.turn else 'b'}"
        bid_turn = f"BID_TURN: {'w' if self.bid_turn else 'b'}"
        w_balance = f"WHITE: {self.balances[chess.WHITE]}"
        b_balance = f"BLACK: {self.balances[chess.BLACK]}"
        if self.bid_history[-1]:
            bid = self.bid_history[-1][-1].amount
        else:
            bid = 0
        prev_bid = f"BID: {bid}"
        return "\n".join(
            [phase, turn, bid_turn, w_balance, b_balance, prev_bid, super().__str__()]
        )


def test_pseudo_chess():
    board = PseudoChess(fen="rnb1kbnr/ppp2ppp/4q3/8/8/8/PPPP4/RNBQ1K1R w KQkq - 0 1")
    print(board)
    while not board.outcome():
        # NOTE: don't do this in prod lol.
        board.turn = chess.WHITE
        try:
            board.push_uci(input("Enter move: "))
        except Exception as e:
            print("invalid move", e)

        print(board)
        print("w" if board.turn else "b")

    print(board.outcome())


def test_open_first_auction_chess():
    game = OpenFirstAuctionChess(
        fen="rnb1kbnr/ppp2ppp/4q3/8/8/8/PPPP4/RNBQ1K1R w KQkq - 0 1"
    )
    print(game)
    while not game.outcome():
        try:
            if game.phase == "bid":
                s = input("Enter bid: ")
                amount = 0 if s == "f" else int(s)

                game.push_bid(Bid(amount, s == "f", game.bid_turn))
            else:
                game.push_uci(input("Enter move: "))
        except Exception as e:
            print("invalid move", e)

        print(game)

    print(game.outcome())


if __name__ == "__main__":
    tests = {
        1: test_pseudo_chess,
        2: test_open_first_auction_chess,
    }
    print("tests: ", tests)
    tests[int(input("Select test:"))]()
