from app.core.auction_chess.board import BoardState, Color, Effect, Marker, MarkerTarget, Piece, PieceType, Position, Square


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

def any_opposite_pawn(color: Color) -> MarkerTarget:
    def f(piece: Piece):
        return piece.type == "p" and piece.color != color
    return f

def capture_effect(target: Square) -> Effect:
    def f():
        target.piece = None
    return f
# Puts a marker at the skipped square for en passent
def pawn_double_move_effect(skipped: Square, end: Square, color: Color) -> Effect:
    def f():
        skipped.marker = Marker(target=any_opposite_pawn(color), 
                                effect=capture_effect(end))
    return f

def set_has_moved_effect(piece: Piece) -> Effect:
    def f():
        piece.hasMoved = True
    return f

def effects(*effects: Effect) -> Effect:
    def f():
        for effect in effects:
            effect()
    return f

def en_passant_test_board_factory() -> BoardState:
    board: BoardState = [[Square() for _ in range(8)] for _ in range(8)]
    board[1][0].piece = Piece(type="p", color="w", hasMoved=False)
    
    board[3][1].piece = Piece(type="p", color="b", hasMoved=False)
    return board
