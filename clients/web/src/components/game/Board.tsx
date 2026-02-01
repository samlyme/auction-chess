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
import { useContext, useEffect, useRef, useState } from "react";
import {
  availableCapture,
  availableMove,
  selectedSquare,
} from "@/components/game/BoardStyle";
import { useMutation } from "@tanstack/react-query";
import { usePlayGameMutationOptions } from "@/queries/game";
import type { AuctionChessState } from "shared/types/game";

import { createGame, makeBoardFen } from "shared/game/utils";
import * as BoardOps from "shared/game/boardOps";
import * as AuctionChess from "shared/game/rules";

import { useGameSounds } from "@/hooks/useGameSounds";
import { createPieces } from "./Pieces";
import { LobbyContext } from "@/contexts/Lobby";
import { GameContext } from "@/contexts/Game";

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
          left: (color === "white" ? fileIndex : 7 - fileIndex) * squareWidth,
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

export function AuctionChessBoard() {
  const { playerColor, lobby } = useContext(LobbyContext);
  const { gameData } = useContext(GameContext);
  const gameState = gameData
    ? gameData.gameState
    : createGame(lobby.config.gameConfig);

  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [promotionMove, setPromotionMove] = useState<NormalMove | null>(null);
  const playGameMutation = useMutation(usePlayGameMutationOptions());

  const [boardFen, setBoardFen] = useState("8/8/8/8/8/8/8/8");
  useEffect(() => {
    // NOTE: the `makeBoardFen` function displays promoted pieces by  a
    // '~' symbol to the front of the character. This breaks the board rendering.
    // Filter it out!
    const newFen = makeBoardFen(gameState.chessState.board).replaceAll("~", "");
    setBoardFen(newFen);
  }, [gameState]);

  const moveOptions = moveFrom
    ? AuctionChess.legalDests(gameState, parseSquare(moveFrom)!, playerColor)
    : [];
  const squareStyles: Record<string, React.CSSProperties> = {};
  if (moveFrom) {
    squareStyles[moveFrom] = selectedSquare;
  }
  for (const moveOption of moveOptions) {
    squareStyles[makeSquare(moveOption)] = BoardOps.getPiece(
      gameState.chessState.board,
      moveOption
    )
      ? availableCapture
      : availableMove;
  }

  function shouldPromote(move: NormalMove): boolean {
    if (
      BoardOps.getPiece(gameState.chessState.board, move.from)?.role !== "pawn"
    )
      return false;
    return SquareSet.backranks().has(move.to);
  }

  function playPromotion(role: Role) {
    if (!promotionMove) return;
    playGameMutation.mutate({
      type: "move",
      data: { ...promotionMove, promotion: role },
    });
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

    if (
      AuctionChess.legalDests(gameState, move.from, playerColor).has(move.to) &&
      shouldPromote(move)
    ) {
      setPromotionMove(move);
      return false;
    }

    if (
      AuctionChess.legalDests(gameState, move.from, playerColor).has(move.to)
    ) {
      playGameMutation.mutate({ type: "move", data: move });
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
    if (
      AuctionChess.legalDests(gameState, move.from, playerColor).has(move.to) &&
      shouldPromote(move)
    ) {
      setPromotionMove(move);
    } else if (
      AuctionChess.legalDests(gameState, move.from, playerColor).has(move.to)
    ) {
      playGameMutation.mutate({ type: "move", data: move });
      setMoveFrom(null);
    } else {
      setMoveFrom(piece === null ? null : square);
    }
  }

  return (
    <>
      <div
        className={`w-full rounded-2xl ${gameData && gameState.phase === "move" ? "bg-green-800" : "bg-neutral-900"} p-4`}
      >
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
              position: boardFen,
              pieces: createPieces(gameState.pieceIncome, gameState.pieceFee),
              onPieceDrag: gameState.phase === "bid" ? undefined : onPieceDrag,
              onPieceDrop: gameState.phase === "bid" ? undefined : onPieceDrop,
              onSquareClick:
                gameState.phase === "bid" ? undefined : onSquareClick,
              squareStyles,
              boardOrientation: playerColor,
              alphaNotationStyle: { fontSize: "var(--text-base)" },
              numericNotationStyle: { fontSize: "var(--text-base)" },
            }}
          />
        </div>
      </div>
    </>
  );
}
