import { defaultPieces, type PieceRenderObject } from "react-chessboard";
import type { PieceValue, Role } from "shared/types/game";

// Map chess piece notation to role
const pieceKeyToRole: Record<string, Role> = {
  K: "king",
  Q: "queen",
  R: "rook",
  B: "bishop",
  N: "knight",
  P: "pawn",
};

// The key is a value like wK = white king.
const createWrappedObject = (
  original: PieceRenderObject,
  pieceIncome?: PieceValue,
  pieceFee?: PieceValue
): PieceRenderObject => {
  return Object.entries(original).reduce((acc, [key, OriginalRenderFn]) => {
    // Extract role from key (e.g., "wK" -> "K" -> "king")
    const pieceChar = key.charAt(1);
    const role = pieceKeyToRole[pieceChar];

    const income = role ? (pieceIncome ? pieceIncome[role] : 0) : 0;
    const fee = role ? (pieceFee ? pieceFee[role] : 0) : 0;

    // Create a new function that accepts the same props
    acc[key] = (props) => (
      <div className="relative">
        {income !== 0 && (
          <div className="absolute top-0 left-2 text-base text-green-500">
            +${income}
          </div>
        )}
        {fee !== 0 && (
          <div className="absolute top-0 right-2 text-base text-red-500">
            -${fee}
          </div>
        )}

        {/* Call the original function, passing the props through */}
        {OriginalRenderFn(props)}
      </div>
    );

    return acc;
  }, {} as PieceRenderObject);
};

export const createPieces = (pieceIncome?: PieceValue, pieceFee?: PieceValue) =>
  createWrappedObject(defaultPieces, pieceIncome, pieceFee);
