import { Position, type Color, type Context, type Outcome } from "chessops";

class PseudoChess extends Position {
    override hasInsufficientMaterial(color: Color): boolean {
        return false
    }

    override isEnd(ctx?: Context): boolean {
        return this.isVariantEnd();
    }

    override isStalemate(ctx?: Context): boolean {
        return false
    }

    override isVariantEnd(): boolean {
        return this.board.king.size() < 2
    }

    override variantOutcome(_ctx?: Context): Outcome | undefined {
        if (!this.isVariantEnd()) return;

        return { winner: this.board.kingOf("white") ? "white" : "black" }
    }
}