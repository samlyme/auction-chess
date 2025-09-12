from typing import Literal
import chess

AuctionStyle = Literal[
    "open_first",
    "open_second",
    "closed_first",
    "closed_second",
    "open-all",
    "closed-all",
]


class Bid:
    amount: int
    fold: bool
    player: chess.Color


class AuctionChess(chess.Board):
    style: AuctionStyle
    
    def __init__(self, fen: str | None = None, *, chess960: bool = False) -> None:
        super().__init__(fen, chess960=chess960)
        self.balances: dict[chess.Color, int] = {
            chess.WHITE: 1000,
            chess.BLACK: 1000,
        }

        self.phase: Literal["bid", "move"] = "bid"

    def push(self, move: chess.Move) -> None:
        # The chess.Board base class implicity chess move turn
        # by not attaching a player to the Move object. Intead it only checks
        # if the start of the move is the correct turn.
        
        # This pushes the responsibility of checking the source of the move up.
        if self.phase != "move":
            raise chess.IllegalMoveError("Can't make moves in bid phase.")

        super().push(move)
        self.phase = "bid"

    def push_bid(self, bid: Bid) -> None:
        raise NotImplementedError()

    def is_legal(self, move: chess.Move) -> bool:
        return not self.is_variant_end() and self.is_pseudo_legal(move)

    # NOTE: "checkmate" logic is hard because i want to implement contracts down the line.
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


class OpenFirstAuctionChess(AuctionChess):
    style: AuctionStyle = "open_first"

    def __init__(self, fen: str | None = None, *, chess960: bool = False) -> None:
        super().__init__(fen, chess960=chess960)

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
            # Initiate move phase for opponent.
            self.phase = "move"
            self.turn = not bid.player
            self.balances[not bid.player] -= bid_stack[-1].amount

            bid_stack.append(bid)
            # NOTE: The player who folds starts the next bid so we do not swap self.bid_turn
            return

        last_bid: Bid = bid_stack[-1]

        # TODO: Implement minimum raise amount
        if bid.amount <= last_bid.amount:
            raise chess.IllegalMoveError("Bids must raise price.")

        bid_stack.append(bid)
        self.bid_turn = not self.bid_turn



if __name__ == "__main__":
    board = AuctionChess(fen="rnb1kbnr/ppp2ppp/4q3/8/8/8/PPPP4/RNBQ1K1R w KQkq - 0 1")
    print(board)
    while not board.outcome():
        board.push_uci(input("Enter move: "))
        print(board)
        print("w" if board.turn else "b")

    print(board.outcome())