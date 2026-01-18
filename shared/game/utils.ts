import { makePiece } from "chessops/fen";
import {getPiece,} from "./pureBoard"
import {  type Board } from "../types/game";

// Need to copy code here because of type mismatch. Board !== PureBoard.
export const makeBoardFen = (board: Board): string => {
  let fen = '';
  let empty = 0;
  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      const square = file + rank * 8;
      const piece = getPiece(board, square);
      if (!piece) empty++;
      else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        fen += makePiece(piece);
      }

      if (file === 7) {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        if (rank !== 0) fen += '/';
      }
    }
  }
  return fen;
};
