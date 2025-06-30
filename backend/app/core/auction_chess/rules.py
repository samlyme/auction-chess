from app.core.auction_chess.board import BoardState, Effect, Piece, PieceType, Square


def standard_board_factory() -> BoardState:
    board: BoardState = [[Square() for _ in range(8)] for _ in range(8)]

    piece_order: list[PieceType]= ["r", "n", "b", "q", "k", "b", "n", "r"]
    for index, piece in enumerate(piece_order):
        board[0][index].piece = Piece(type=piece, color="w", hasMoved=False)
        board[7][index].piece = Piece(type=piece, color="b", hasMoved=False)

    for i in range(8):
        board[1][i].piece = Piece(type="p", color="w", hasMoved=False)

    for i in range(8):
        board[6][i].piece = Piece(type="p", color="b", hasMoved=False)

    return board

def set_has_moved_effect(piece: Piece) -> Effect:
    def f():
        piece.hasMoved = True
    return f

def effects(**effects: Effect) -> Effect:
    def f():
        for effect in effects.values():
            effect()
    return f