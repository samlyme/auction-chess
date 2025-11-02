import {
  attacks,
  Board,
  opposite,
  squareRank,
  SquareSet,
  type Color,
  type NormalMove,
  type Outcome,
  type Setup,
  type Square,
} from "chessops";
import { makeFen, parseBoardFen, parseFen } from "chessops/fen";

export class PseudoChess {
  setup: Setup;

  constructor(fen: string) {
    this.setup = parseFen(fen).unwrap();
  }

  //   Need this because pawn moves and attacks are different
  private pawnMoves(from: Square): SquareSet {
    console.log("making pawn move from", from);
    
    const piece = this.setup.board.get(from);
    if (!piece || piece.role !== "pawn") throw new Error("not pawn square");

    const delta = piece.color === "white" ? 8 : -8;
    const hasMoved: boolean =
      piece.color === "white" ? from >= 16 : from < 64 - 16;

    console.log("hasMoved", hasMoved);
    

    let moves = SquareSet.empty();
    if (!this.setup.board.has(from + delta)) {
      moves = moves.with(from + delta);

      if (!hasMoved && !this.setup.board.has(from + 2 * delta)) {
        moves = moves.with(from + 2*delta);
      }
    }

    const potentialAttacks = attacks(piece, from, this.setup.board.occupied);

    const opps = this.setup.board[opposite(piece.color)];
    // check for ep Square color
    if (this.setup.epSquare) {
      console.log("can en passant");
      
      const rank = squareRank(this.setup.epSquare);
      if (
        (piece.color === "white" && rank === 6) ||
        (piece.color === "black" && rank == 3)
      ) {
        opps.with(this.setup.epSquare);
      }
    }

    return moves.union(potentialAttacks.intersect(opps));
  }

  legalDests(from: Square): SquareSet {
    const piece = this.setup.board.get(from);
    if (!piece) return SquareSet.empty();

    if (piece.role === "pawn") return this.pawnMoves(from);

    return attacks(piece, from, this.setup.board.occupied).diff(
      this.setup.board[piece.color]
    );
  }

  //   TODO: handle castling
  // TODO: check for promotions
  *legalMoves(color: Color): Generator<NormalMove> {
    for (const from of this.setup.board[color]) {
      for (const to of this.legalDests(from)) {
        yield { from, to };
      }
    }
  }

  movePiece(move: NormalMove): boolean {
    if (this.legalDests(move.from).has(move.to)) {
      const peice = this.setup.board.take(move.from)!;
      this.setup.board.set(move.to, peice);
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
