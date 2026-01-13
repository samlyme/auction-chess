import {
  attacks,
  between,
  bishopAttacks,
  Board,
  kingAttacks,
  kingCastlesTo,
  knightAttacks,
  opposite,
  pawnAttacks,
  rookAttacks,
  squareRank,
  SquareSet,
  type Color,
  type NormalMove,
  type Outcome,
  type Piece,
  type Role,
  type Setup,
  type Square,
} from "chessops";
import { makeFen, parseFen } from "chessops/fen";
import { rookCastlesTo, squareFromCoords } from "chessops/util";

const attacksTo = (
  square: Square,
  attacker: Color,
  board: Board,
): SquareSet => {
  const occupied = board.occupied;
  return board[attacker].intersect(
    rookAttacks(square, occupied)
      .intersect(board.rooksAndQueens())
      .union(
        bishopAttacks(square, occupied).intersect(board.bishopsAndQueens()),
      )
      .union(knightAttacks(square).intersect(board.knight))
      .union(kingAttacks(square).intersect(board.king))
      .union(pawnAttacks(opposite(attacker), square).intersect(board.pawn)),
  );
};

export class PseudoChess {
  private setup: Setup;

  constructor(fen: string) {
    this.setup = parseFen(fen).unwrap();
  }

  get(square: Square): Piece | undefined {
    return this.setup.board.get(square);
  }

  //   Need this because pawn moves and attacks are different
  private pawnMoves(from: Square): SquareSet {
    const piece = this.setup.board.get(from);
    if (!piece || piece.role !== "pawn") throw new Error("not pawn square");

    const delta = piece.color === "white" ? 8 : -8;
    const hasMoved: boolean =
      piece.color === "white" ? from >= 16 : from < 64 - 16;

    let moves = SquareSet.empty();
    if (!this.setup.board.has(from + delta)) {
      moves = moves.with(from + delta);

      if (!hasMoved && !this.setup.board.has(from + 2 * delta)) {
        moves = moves.with(from + 2 * delta);
      }
    }

    const potentialAttacks = attacks(piece, from, this.setup.board.occupied);

    let opps = this.setup.board[opposite(piece.color)];
    // check for ep Square color
    if (this.setup.epSquare) {
      const rank = squareRank(this.setup.epSquare);

      if (
        (piece.color === "white" && rank === 5) ||
        (piece.color === "black" && rank == 2)
      ) {
        opps = opps.with(this.setup.epSquare);
      }
    }

    return moves.union(potentialAttacks.intersect(opps));
  }

  private kingMoves(from: Square): SquareSet {
    const piece = this.setup.board.get(from);
    if (!piece || piece.role !== "king") throw new Error("not king square");

    let moves = attacks(piece, from, this.setup.board.occupied).diff(
      this.setup.board[piece.color],
    );

    if (!this.isCheck(piece.color)) {
      const legalRooks = this.setup.castlingRights.intersect(
        SquareSet.backrank(piece.color),
      );

      for (const rook of legalRooks) {
        if (
          between(from, rook).intersect(this.setup.board.occupied).isEmpty()
        ) {
          moves = moves.with(
            kingCastlesTo(piece.color, from < rook ? "h" : "a"),
          );
        }
      }
    }

    return moves;
  }

  isCheck(color: Color): boolean {
    const king = this.setup.board.kingOf(color);
    if (!king) return true;

    return !attacksTo(king, opposite(color), this.setup.board).isEmpty();
  }

  legalDests(from: Square): SquareSet {
    const piece = this.setup.board.get(from);
    if (!piece) return SquareSet.empty();

    if (piece.role === "pawn") {
      return this.pawnMoves(from);
    }

    if (piece.role === "king") {
      return this.kingMoves(from);
    }

    return attacks(piece, from, this.setup.board.occupied).diff(
      this.setup.board[piece.color],
    );
  }

  *legalMoves(color: Color): Generator<NormalMove> {
    for (const from of this.setup.board[color]) {
      for (const to of this.legalDests(from)) {
        if (this.setup.board.pawn.has(from) && SquareSet.backranks().has(to)) {
          // promotion
          const promotionOptions: Role[] = [
            "queen",
            "rook",
            "bishop",
            "knight",
          ];
          const promotionMoves: NormalMove[] = promotionOptions.map((role) => {
            return { from, to, promotion: role };
          });

          yield* promotionMoves;
        } else yield { from, to };
      }
    }
  }

  isLegalDest(move: NormalMove, color: Color | null = null): boolean {
    if (move.promotion == "king" || move.promotion == "pawn") return false;
    const dests = this.legalDests(move.from);

    if (color)
      return dests.has(move.to) && this.setup.board[color].has(move.from);
    return dests.has(move.to);
  }

  movePiece(move: NormalMove, color: Color): boolean {
    if (!this.setup.board[color].has(move.from)) return false;

    if (this.legalDests(move.from).has(move.to)) {
      const piece = this.setup.board.take(move.from)!;

      if (piece.role === "king") {
        const isCastling = Math.abs(move.to - move.from) == 2;
        const castlingSide: "a" | "h" = move.to - move.from > 0 ? "h" : "a";

        if (isCastling) {
          const rookFrom = squareFromCoords(
            castlingSide === "a" ? 0 : 7,
            piece.color === "white" ? 0 : 7,
          )!;
          const rookTo = rookCastlesTo(piece.color, castlingSide);

          const rook = this.setup.board.take(rookFrom)!;
          this.setup.board.set(rookTo, rook);
        }

        this.setup.castlingRights = this.setup.castlingRights.diff(
          SquareSet.backrank(piece.color).intersect(SquareSet.corners()),
        );
      }
      if (piece.role === "rook") {
        this.setup.castlingRights = this.setup.castlingRights.without(
          move.from,
        );
      }

      if (piece.role === "pawn" && move.to === this.setup.epSquare) {
        const delta = piece.color === "white" ? 8 : -8;

        const taken = this.setup.board.take(move.to - delta);
        if (!taken || taken.role !== "pawn" || taken.color === piece.color) {
          throw new Error("broken en passant");
        }
      }

      this.setup.epSquare = undefined;
      if (piece.role === "pawn") {
        if (Math.abs(move.to - move.from) == 16) {
          this.setup.epSquare = (move.to + move.from) / 2;
        }
      }
      const taken = this.setup.board.set(move.to, piece);
      if (taken && taken.role == "rook") {
        this.setup.castlingRights = this.setup.castlingRights.without(move.to);
      }

      if (move.promotion) {
        this.setup.board[piece.role] = this.setup.board[piece.role].without(
          move.to,
        );
        this.setup.board[move.promotion] = this.setup.board[
          move.promotion
        ].with(move.to);
      }
      return true;
    }

    return false;
  }

  toFen(): string {
    return makeFen(this.setup);
  }

  outcome(): Outcome {
    if (this.setup.board.kingOf("white") === undefined)
      return { winner: "black" };
    if (this.setup.board.kingOf("black") === undefined)
      return { winner: "white" };
    return { winner: undefined };
  }
}
