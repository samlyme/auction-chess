from typing import Iterator, Literal
import chess
from chess import BB_ALL, Bitboard, Move, Outcome, Termination

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

    def __init__(self, amount: int, fold: bool, player: chess.Color) -> None:
        self.amount = amount
        self.fold = fold 
        self.player = player


class AuctionChess(chess.Board):
    """
    This class provides a stripped back variant of chess where pseudo-legal moves
    are legal, and there is no checkmate. You have to capture the king to win.
    """
    style: AuctionStyle
    
    def __init__(self, fen: str | None = None, *, chess960: bool = False) -> None:
        super().__init__(fen, chess960=chess960)
        self.balances: dict[chess.Color, int] = {
            chess.WHITE: 1000,
            chess.BLACK: 1000,
        }

        self.phase: Literal["bid", "move"] = "bid"

    def push(self, move: chess.Move) -> None:
        # The chess.Board base class implicity checks move turn
        # by not attaching a player to the Move object. Intead it only checks
        # if the start of the move is the correct turn.
        
        # This pushes the responsibility of checking the source of the move up.
        if self.phase != "move":
            raise chess.IllegalMoveError("Can't make moves in bid phase.")

        super().push(move)
        self.phase = "bid"

    def push_bid(self, bid: Bid) -> None:
        raise NotImplementedError()

    """
    Override all the legality checks.
    """
    def is_legal(self, move: chess.Move) -> bool:
        return self.is_pseudo_legal(move)
    def has_legal_en_passant(self) -> bool:
        return self.has_pseudo_legal_en_passant()
    def generate_legal_moves(self, from_mask: Bitboard = BB_ALL, to_mask: Bitboard = BB_ALL) -> Iterator[Move]:
        if self.is_variant_end():
            return
        yield from self.generate_pseudo_legal_moves(from_mask, to_mask)


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

        if claim_draw:
            if self.can_claim_fifty_moves():
                return Outcome(Termination.FIFTY_MOVES, None)
            if self.can_claim_threefold_repetition():
                return Outcome(Termination.THREEFOLD_REPETITION, None)

        return None


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
        # NOTE: don't do this in prod lol.
        board.phase = "move"
        board.turn = chess.WHITE
        try:
            board.push_uci(input("Enter move: "))
        except Exception as e:
            print("invalid move", e)

        print(board)
        print("w" if board.turn else "b")

    print(board.outcome())