import {
  attacks,
  between,
  kingCastlesTo,
  opposite,
  squareRank,
  SquareSet,
  type Color,
  type NormalMove,
  type Piece,
  type Role,
  type Square,
} from "chessops";
import type { Board, ChessState } from "../types/game";
import { defaultBoard, getPiece, set, take } from "./boardOps";
import { attacksTo } from "./utils";
import type { Result } from "../types/result";
import { rookCastlesTo, squareFromCoords } from "chessops/util";

export const defaultSetup: ChessState = {
  board: defaultBoard,
  castlingRights: SquareSet.corners(),
  epSquare: undefined,
};

function pawnMoves(setup: ChessState, from: Square): SquareSet {
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

function kingMoves(setup: ChessState, from: Square): SquareSet {
  const piece = getPiece(setup.board, from);
  if (!piece || piece.role !== "king") throw new Error("not king square");

  let moves = attacks(piece, from, setup.board.occupied).diff(
    setup.board[piece.color],
  );

  if (!isCheck(setup.board, piece.color)) {
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

export function isCheck(board: Board, color: Color): boolean {
  const king = board.king.intersect(board[color]);
  if (king.isEmpty()) return true;

  const kingSquare = king.first() as Square; // don't know why that requires cast.

  return !attacksTo(kingSquare, opposite(color), board).isEmpty();
}

export function legalDests(setup: ChessState, from: Square): SquareSet {
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
  setup: ChessState,
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
  setup: ChessState,
  move: NormalMove,
): Result<{ moved: Piece; taken: Piece | null }> {
  if (!legalDests(setup, move.from).has(move.to)) {
    return { ok: false, error: "Move no to valid square." };
  }

  const piece = getPiece(setup.board, move.from)!;
  let taken: Piece | null = null;
  setup.board = take(setup.board, move.from);

  if (piece.role === "king") {
    const isCastling = Math.abs(move.to - move.from) == 2;
    const castlingSide: "a" | "h" = move.to - move.from > 0 ? "h" : "a";
    if (isCastling) {
      const rookFrom = squareFromCoords(
        castlingSide === "a" ? 0 : 7,
        piece.color === "white" ? 0 : 7,
      )!;
      const rookTo = rookCastlesTo(piece.color, castlingSide);

      const rook = getPiece(setup.board, rookFrom)!;
      setup.board = take(setup.board, rookFrom);

      setup.board = set(setup.board, rookTo, rook);
    }

    // Remove castling rights for the side that moved king.
    setup.castlingRights = setup.castlingRights.diff(
      SquareSet.backrank(piece.color).intersect(SquareSet.corners()),
    );
  }

  if (piece.role === "pawn" && move.to === setup.epSquare) {
    const delta = piece.color === "white" ? 8 : -8;
    const toTake = move.to - delta;

    const takenPawn = getPiece(setup.board, toTake);
    if (
      !takenPawn ||
      takenPawn.role !== "pawn" ||
      takenPawn.color === piece.color
    ) {
      throw new Error("broken en passant");
    }

    taken = takenPawn;
    setup.board = take(setup.board, toTake);
  }

  setup.epSquare = undefined;
  if (piece.role === "pawn" && Math.abs(move.to - move.from) === 16) {
    setup.epSquare = (move.to + move.from) / 2;
  }

  const captured = getPiece(setup.board, move.to);
  if (!taken) taken = captured || null;

  setup.board = take(setup.board, move.to); // Remove captured piece if any
  setup.board = set(setup.board, move.to, piece);
  // if rook moved, remove castling rights.
  setup.castlingRights = setup.castlingRights.intersect(setup.board.rook);

  if (move.promotion) {
    setup.board[piece.role] = setup.board[piece.role].without(move.to);
    setup.board[move.promotion] = setup.board[move.promotion].with(move.to);
    setup.board.promoted = setup.board.promoted.with(move.to);
  }

  return { ok: true, value: { moved: piece, taken } };
}
