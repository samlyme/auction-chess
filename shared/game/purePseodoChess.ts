import {
  attacks,
  between,
  bishopAttacks,
  defaultSetup,
  kingAttacks,
  kingCastlesTo,
  knightAttacks,
  opposite,
  pawnAttacks,
  ROLES,
  rookAttacks,
  squareRank,
  SquareSet,
  type Color,
  type NormalMove,
  type Piece,
  type Role,
} from "chessops";
import { makeBoardFen, makeFen, parseFen } from "chessops/fen";
import { Square, type Result } from "../types";
import { rookCastlesTo, squareFromCoords } from "chessops/util";
import { produce } from "immer";

export interface PureBoard {
  /**
   * All occupied squares.
   */
  readonly occupied: SquareSet;
  /**
   * All squares occupied by pieces known to be promoted. This information is
   * relevant in chess variants like Crazyhouse.
   */
  readonly promoted: SquareSet;
  readonly white: SquareSet;
  readonly black: SquareSet;
  readonly pawn: SquareSet;
  readonly knight: SquareSet;
  readonly bishop: SquareSet;
  readonly rook: SquareSet;
  readonly queen: SquareSet;
  readonly king: SquareSet;
}

export const emptyPureBoard: PureBoard = {
  occupied: new SquareSet(0xffff, 0xffff_0000),
  promoted: SquareSet.empty(),
  white: new SquareSet(0xffff, 0),
  black: new SquareSet(0, 0xffff_0000),
  pawn: new SquareSet(0xff00, 0x00ff_0000),
  knight: new SquareSet(0x42, 0x4200_0000),
  bishop: new SquareSet(0x24, 0x2400_0000),
  rook: new SquareSet(0x81, 0x8100_0000),
  queen: new SquareSet(0x8, 0x0800_0000),
  king: new SquareSet(0x10, 0x1000_0000),
};

export function getColor(board: PureBoard, square: Square): Color | undefined {
  if (board.white.has(square)) return "white";
  if (board.black.has(square)) return "black";
  return undefined;
}

export function getRole(board: PureBoard, square: Square): Role | undefined {
  for (const role of ROLES) {
    if (board[role].has(square)) return role;
  }
  return undefined;
}

export function getPiece(board: PureBoard, square: Square): Piece | undefined {
  const color = getColor(board, square);
  if (!color) return;
  const role = getRole(board, square)!;
  const promoted = board.promoted.has(square);
  return { color, role, promoted };
}

export function take(board: PureBoard, square: Square): PureBoard {
  const {
    occupied,
    promoted,
    white,
    black,
    pawn,
    knight,
    bishop,
    rook,
    queen,
    king,
  } = board;
  return {
    occupied: occupied.without(square),
    promoted: promoted.without(square),
    white: white.without(square),
    black: black.without(square),
    pawn: pawn.without(square),
    knight: knight.without(square),
    bishop: bishop.without(square),
    rook: rook.without(square),
    queen: queen.without(square),
    king: king.without(square),
  };
}

export function set(board: PureBoard, square: Square, piece: Piece): PureBoard {
  const {
    occupied,
    promoted,
    white,
    black,
    pawn,
    knight,
    bishop,
    rook,
    queen,
    king,
  } = board;
  return {
    occupied: occupied.with(square),
    promoted: piece.promoted ? promoted.with(square) : promoted,

    white: piece.color === "white" ? white.with(square) : white,
    black: piece.color === "black" ? black.with(square) : black,

    pawn: piece.role === "pawn" ? pawn.with(square) : pawn,
    knight: piece.role === "knight" ? knight.with(square) : knight,
    bishop: piece.role === "bishop" ? bishop.with(square) : bishop,
    rook: piece.role === "rook" ? rook.with(square) : rook,
    queen: piece.role === "queen" ? queen.with(square) : queen,
    king: piece.role === "king" ? king.with(square) : king,
  };
}

export interface PureSetup {
  board: PureBoard;
  // pockets: Material | undefined;
  turn: Color;
  castlingRights: SquareSet;
  epSquare: Square | undefined;
  // remainingChecks: RemainingChecks | undefined;
  halfmoves: number;
  fullmoves: number;
}

export function pureParseFen(fen: string): PureSetup {
  return parseFen(fen).unwrap();
}

// export function pureToFen(setup: PureSetup): string {
//   makeFen(setup)
//   makeBoardFen(setup.board)
//   return "";
// }

export function pureDefaultSetup(): PureSetup {
  return defaultSetup();
}

export function pawnMoves(setup: PureSetup, from: Square): SquareSet {
  const piece = getPiece(setup.board, from);
  if (!piece || piece.role !== "pawn") throw new Error("not pawn square");

  const delta = piece.color === "white" ? 8 : -8;
  const hasMoved: boolean =
    piece.color === "white" ? from >= 16 : from < 64 - 16;

  let moves = SquareSet.empty();
  if (!setup.board.occupied.has(from + delta)) {
    moves = moves.with(from + delta);

    if (!hasMoved && !setup.board.occupied.has(from + 2 * delta)) {
      moves = moves.with(from + 2 * delta);
    }
  }

  const potentialAttacks = attacks(piece, from, setup.board.occupied);

  let opps = setup.board[opposite(piece.color)];
  // check for ep Square color
  if (setup.epSquare) {
    const rank = squareRank(setup.epSquare);

    if (
      (piece.color === "white" && rank === 5) ||
      (piece.color === "black" && rank == 2)
    ) {
      opps = opps.with(setup.epSquare);
    }
  }

  return moves.union(potentialAttacks.intersect(opps));
}

export function kingMoves(setup: PureSetup, from: Square): SquareSet {
  const piece = getPiece(setup.board, from);
  if (!piece || piece.role !== "king") throw new Error("not king square");

  let moves = attacks(piece, from, setup.board.occupied).diff(
    setup.board[piece.color],
  );

  if (isCheck(setup.board, piece.color)) {
    const legalRooks = setup.castlingRights.intersect(
      SquareSet.backrank(piece.color),
    );

    for (const rook of legalRooks) {
      if (between(from, rook).intersect(setup.board.occupied).isEmpty()) {
        moves = moves.with(kingCastlesTo(piece.color, from < rook ? "h" : "a"));
      }
    }
  }

  return moves;
}

export function isCheck(board: PureBoard, color: Color): boolean {
  const king = board.king.intersect(board[color]);
  if (king.isEmpty()) return true;

  const kingSquare = king.first() as Square; // don't know why that requires cast.

  return !attacksTo(kingSquare, opposite(color), board).isEmpty();
}

export function legalDests(setup: PureSetup, from: Square): SquareSet {
  const piece = getPiece(setup.board, from);
  if (!piece) return SquareSet.empty();

  if (piece.role === "pawn") {
    return pawnMoves(setup, from);
  }

  if (piece.role === "king") {
    return kingMoves(setup, from);
  }

  return attacks(piece, from, setup.board.occupied).diff(
    setup.board[piece.color],
  );
}

export function* legalMoves(
  setup: PureSetup,
  color: Color,
): Generator<NormalMove> {
  for (const from of setup.board[color]) {
    for (const to of legalDests(setup, from)) {
      const hasPromotion =
        setup.board.pawn.has(from) && SquareSet.backranks().has(to);
      if (hasPromotion) {
        const promotionOptions: Role[] = ["queen", "rook", "bishop", "knight"];
        const promotionMoves: NormalMove[] = promotionOptions.map((role) => {
          return { from, to, promotion: role };
        });
        yield* promotionMoves;
      } else {
        yield { from, to };
      }
    }
  }
}

export function movePiece(
  setup: PureSetup,
  move: NormalMove,
): Result<PureSetup> {
  if (!setup.board[setup.turn].has(move.from)) {
    return { ok: false, error: "Move not from valid square." };
  }
  if (!legalDests(setup, move.from).has(move.to)) {
    return { ok: false, error: "Move no to valid square." };
  }

  const piece = getPiece(setup.board, move.from)!;

  try {
    const out = produce(setup, (draft) => {
      if (piece.role === "king") {
        const isCastling = Math.abs(move.to - move.from) == 2;
        const castlingSide: "a" | "h" = move.to - move.from > 0 ? "h" : "a";
        if (isCastling) {
          const rookFrom = squareFromCoords(
            castlingSide === "a" ? 0 : 7,
            piece.color === "white" ? 0 : 7,
          )!;
          const rookTo = rookCastlesTo(piece.color, castlingSide);

          const rook = getPiece(draft.board, rookFrom)!;
          draft.board = take(draft.board, move.from);
          draft.board = set(draft.board, rookTo, rook);
        }

        // Remove castling rights for the side that moved king.
        draft.castlingRights = draft.castlingRights.diff(
          SquareSet.backrank(piece.color).intersect(SquareSet.corners()),
        );
      }

      // check for en passant
      if (piece.role === "pawn" && move.to === draft.epSquare) {
        const delta = piece.color === "white" ? 8 : -8;
        const toTake = move.to - delta;

        const taken = getPiece(draft.board, toTake);
        if (!taken || taken.role !== "pawn" || taken.color === piece.color) {
          throw new Error("broken en passant");
        }
        draft.board = take(draft.board, toTake);
      }

      draft.epSquare = undefined;
      // Reset epSquare
      if (piece.role === "pawn" && Math.abs(move.to - move.from) === 16) {
        draft.epSquare = (move.to + move.from) / 2; // evil average trick.
      }

      // Castling only happens when rook is there!
      draft.castlingRights = draft.castlingRights.intersect(draft.board.rook);

      if (move.promotion) {
        draft.board[piece.role] = draft.board[piece.role].without(move.to);
        draft.board[move.promotion] = draft.board[move.promotion].with(move.to);
      }
    });
    return { ok: true, value: out };
  } catch (e) {
    return { ok: false, error: e };
  }
}

function attacksTo(
  square: Square,
  attacker: Color,
  board: PureBoard,
): SquareSet {
  const occupied = board.occupied;
  return board[attacker].intersect(
    rookAttacks(square, occupied)
      .intersect(board.queen.union(board.rook))
      .union(
        bishopAttacks(square, occupied).intersect(
          board.queen.union(board.bishop),
        ),
      )
      .union(knightAttacks(square).intersect(board.knight))
      .union(kingAttacks(square).intersect(board.king))
      .union(pawnAttacks(opposite(attacker), square).intersect(board.pawn)),
  );
}
