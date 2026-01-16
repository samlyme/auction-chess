import { PseudoChess } from "shared/game/pseudoChess";
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
import {
  Chessboard,
  defaultPieces,
  type PieceDropHandlerArgs,
  type PieceHandlerArgs,
  type SquareHandlerArgs,
} from "react-chessboard";
import { useState } from "react";
import {
  availableCapture,
  availableMove,
  selectedSquare,
} from "@/components/game/BoardStyle";
import type { AuctionChessState } from "shared/types";
import { useMutation } from "@tanstack/react-query";
import { useMakeMoveMutationOptions } from "@/queries/game";

function PromotionMenu({
  color,
  fileIndex,
  cancel,
  select,
}: {
  color: Color;
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

interface BoardProps {
  gameState: AuctionChessState;
  playerColor: Color;
}

export function AuctionChessBoard({ gameState, playerColor }: BoardProps) {
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [promotionMove, setPromotionMove] = useState<NormalMove | null>(null);
  const makeMoveMutation = useMutation(useMakeMoveMutationOptions());

  const chessLogic = new PseudoChess(gameState.chessState.fen);

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
    if (!promotionMove) return;
    makeMoveMutation.mutate({ ...promotionMove, promotion: role });
    setMoveFrom(null);
    setPromotionMove(null);
  }

  function onPieceDrag({ square, piece }: PieceHandlerArgs): void {
    const pieceColor = piece.pieceType.includes("w") ? "white" : "black";
    if (pieceColor === playerColor) setMoveFrom(square);
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
      makeMoveMutation.mutate(move);
      setMoveFrom(null);
      setPromotionMove(null);
      return true;
    }

    setMoveFrom(null);
    setPromotionMove(null);
    return false;
  }

  function onSquareClick({ square, piece }: SquareHandlerArgs): void {
    if (moveFrom === square) {
      setMoveFrom(null);
      return;
    }

    if (moveFrom === null) {
      if (!piece) {
        setMoveFrom(null);
        return;
      }

      const pieceColor = piece.pieceType.includes("w") ? "white" : "black";
      setMoveFrom(pieceColor === playerColor ? square : null);
      return;
    }

    const move = { from: parseSquare(moveFrom)!, to: parseSquare(square)! };
    if (chessLogic.isLegalDest(move, playerColor) && shouldPromote(move)) {
      setPromotionMove(move);
    } else if (chessLogic.isLegalDest(move, playerColor)) {
      makeMoveMutation.mutate(move);
      setMoveFrom(null);
    } else {
      setMoveFrom(piece === null ? null : square);
    }
  }

  return (
    <div>
      {gameState.outcome && (
        <h1>
          {gameState.outcome
            ? gameState.outcome.winner === playerColor
              ? "You win!"
              : "You lose."
            : "Draw."}
        </h1>
      )}
      {promotionMove && (
        <PromotionMenu
          color={playerColor}
          fileIndex={squareFile(promotionMove.to)}
          cancel={() => setPromotionMove(null)}
          select={playPromotion}
        />
      )}
      <div
        className={`board-wrapper ${gameState.phase === "bid" ? "grayed-out" : ""}`}
      >
        <Chessboard
          options={{
            position: gameState.chessState.fen,
            onPieceDrag: gameState.phase === "bid" ? undefined : onPieceDrag,
            onPieceDrop: gameState.phase === "bid" ? undefined : onPieceDrop,
            onSquareClick:
              gameState.phase === "bid" ? undefined : onSquareClick,
            squareStyles,
            boardOrientation: playerColor,
            alphaNotationStyle: { fontSize: "var(--text-base)" }
          }}
        />
      </div>
    </div>
  );
}
