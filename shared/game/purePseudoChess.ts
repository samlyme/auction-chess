import {
  SquareSet,
  type Square,
  attacks,
  opposite,
  squareRank,
  between,
  kingCastlesTo,
  type Color,
  type NormalMove,
  type Role,
  rookAttacks,
  bishopAttacks,
  knightAttacks,
  kingAttacks,
  pawnAttacks,
} from "chessops";
import {
  squareFromCoords,
  rookCastlesTo,
} from "chessops/util";
import { produce } from "immer";
import type { Result } from "../types/result";
import {
  defaultBoard,
  getPiece,
  set,
  take,
} from "./pureBoard";

import type { Board, ChessState } from "../types/game";

export const pureDefaultSetup: ChessState = {
  board: defaultBoard,
  castlingRights: SquareSet.corners(),
  epSquare: undefined,
};

export function pawnMoves(setup: ChessState, from: Square): SquareSet {
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

export function kingMoves(setup: ChessState, from: Square): SquareSet {
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
): Result<ChessState> {
  if (!legalDests(setup, move.from).has(move.to)) {
    return { ok: false, error: "Move no to valid square." };
  }

  try {
    const out = produce(setup, (draft) => {
      const piece = getPiece(draft.board, move.from)!;
      draft.board = take(draft.board, move.from);

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
          draft.board = take(draft.board, rookFrom);

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

      draft.board = take(draft.board, move.to); // Remove captured piece if any
      draft.board = set(draft.board, move.to, piece);
      // Castling only happens when rook is there!
      draft.castlingRights = draft.castlingRights.intersect(draft.board.rook);

      if (move.promotion) {
        draft.board[piece.role] = draft.board[piece.role].without(move.to);
        draft.board[move.promotion] = draft.board[move.promotion].with(move.to);
        draft.board.promoted = draft.board.promoted.with(move.to);
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
  board: Board,
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
