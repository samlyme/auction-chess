import type { Result } from "@badrap/result";
import { Position, PositionError, type Color, type Context, type Move, type Outcome, type Setup } from "chessops";

export class PseudoChess extends Position {

    constructor (setup: Setup) {
        super("chess")
        super.setupUnchecked(setup)
    }
    
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

    override isLegal(move: Move, ctx?: Context): boolean {
        return true;
    }

    override variantOutcome(_ctx?: Context): Outcome | undefined {
        if (!this.isVariantEnd()) return;

        return { winner: this.board.kingOf("white") ? "white" : "black" }
    }
}