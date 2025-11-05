// TODO: for multiplayer, think about browser to browser connections.
import type { Game, Move } from "boardgame.io";
import { PseudoChess } from "../game/pseudoChess";
import {
  makeSquare,
  parseSquare,
  roleToChar,
  squareFile,
  SquareSet,
  type Color,
  type NormalMove,
  type Role,
} from "chessops";
import { INVALID_MOVE, TurnOrder } from "boardgame.io/core";
import {
  Chessboard,
  defaultPieces,
  type PieceDataType,
  type PieceDropHandlerArgs,
  type PieceHandlerArgs,
  type SquareHandlerArgs,
} from "react-chessboard";
import type { BoardProps } from "boardgame.io/dist/types/packages/react";
import { useState } from "react";
import {
  availableCapture,
  availableMove,
  selectedSquare,
} from "../styles/BoardStyle";



export interface ChessState {
  fen: string;
}

const movePiece: Move<ChessState> = ({ G }, move: NormalMove) => {
  // Consider a refactor. Recreating the class per move COULD be a bottleneck.
  const chessLogic = new PseudoChess(G.fen);
  if (!chessLogic.movePiece(move)) return INVALID_MOVE;
  G.fen = chessLogic.toFen();
};

export const PseudoChessGame: Game<ChessState> = {
  setup: () => ({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  }),

  turn: {
    order: TurnOrder.CUSTOM(["white", "black"]),
    minMoves: 1,
    maxMoves: 1,
  },

  moves: {
    movePiece,
  },

  endIf: ({ G, ctx }) => {
    const chessLogic: PseudoChess = new PseudoChess(G.fen);

    const outcome = chessLogic.outcome();
    if (outcome.winner) return outcome;
  },
};

function PromotionMenu({
  color,
  fileIndex,
  cancel,
  select,
}: {
  color: Color,
  fileIndex: number;
  cancel: () => void;
  select: (role: Role) => void;
}) {
  const squareWidth =
    document
      .querySelector(`[data-column="a"][data-row="1"]`)
      ?.getBoundingClientRect()?.width ?? 0;

  return (
    <div className="promotion-menu" style={{ position: "relative" }}>
      <div
        onClick={cancel}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: squareWidth * 8,
          width: squareWidth * 8,
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: fileIndex * squareWidth,
          backgroundColor: "white",
          width: squareWidth,
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.5)",
        }}
      >
        {(["queen", "rook", "bishop", "knight"] as Role[]).map((role) => (
          <button
            key={role}
            onClick={() => {
              select(role);
            }}
            style={{
              width: "100%",
              aspectRatio: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              border: "none",
              cursor: "pointer",
            }}
          >
            {defaultPieces[`${color[0]}${roleToChar(role).toUpperCase()}`]!()}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PseudoChessBoard({ G, ctx, moves }: BoardProps) {
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [promotionMove, setPromotionMove] = useState<NormalMove | null>(null);

  const chessLogic = new PseudoChess(G.fen);

  const moveOptions = moveFrom
    ? chessLogic.legalDests(parseSquare(moveFrom)!)
    : [];
  const squareStyles: Record<string, React.CSSProperties> = {};
  if (moveFrom) {
    squareStyles[moveFrom] = selectedSquare;
  }
  for (const moveOption of moveOptions) {
    squareStyles[makeSquare(moveOption)] = chessLogic.get(moveOption)
      ? availableCapture
      : availableMove;
  }

  function shouldPromote(move: NormalMove): boolean {
    if (chessLogic.get(move.from)?.role !== "pawn") return false;
    return SquareSet.backranks().has(move.to);
  }

  function playPromotion(role: Role) {
    moves.movePiece!({ ...promotionMove, promotion: role });
    setMoveFrom(null);
    setPromotionMove(null);
  }

  function onPieceDrag({ square }: PieceHandlerArgs): void {
    setMoveFrom(square);
  }

  function onPieceDrop({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs): boolean {
    if (!targetSquare) return false;

    const move = {
      from: parseSquare(sourceSquare)!,
      to: parseSquare(targetSquare)!,
    };

    if (chessLogic.isLegalDest(move) && shouldPromote(move)) {
      setPromotionMove(move);
      return false;
    }

    if (chessLogic.isLegalDest(move)) {
      moves.movePiece!(move);
      setMoveFrom(null);
      setPromotionMove(null);
      return true;
    }

    setMoveFrom(null);
    setPromotionMove(null);
    return false;
  }

  function onSquareClick({ square, piece }: SquareHandlerArgs): void {
    if (moveFrom === null) {
      setMoveFrom(piece === null ? null : square);
      return;
    }

    if (moveFrom === square) {
      setMoveFrom(null);
      return;
    }

    const move = { from: parseSquare(moveFrom)!, to: parseSquare(square)! };
    if (chessLogic.isLegalDest(move) && shouldPromote(move)) {
      setPromotionMove(move);
    }
    else if (chessLogic.isLegalDest(move)) {
      moves.movePiece!(move);
      setMoveFrom(null);
    } else {
      setMoveFrom(piece === null ? null : square);
    }
  }

  return (
    <>
      {promotionMove && (
        <PromotionMenu
          color={ctx.playOrder[ctx.playOrderPos] as Color}
          fileIndex={squareFile(promotionMove.to)}
          cancel={() => setPromotionMove(null)}
          select={playPromotion}
        />
      )}
      <Chessboard
        options={{
          position: G.fen,
          onPieceDrag,
          onPieceDrop,
          onSquareClick,
          squareStyles,
        }}
      />
    </>
  );
}
