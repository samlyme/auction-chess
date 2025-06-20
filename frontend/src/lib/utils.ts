import bB from "../assets/peices/bishop-b.svg";
import wB from "../assets/peices/bishop-w.svg";
import bK from "../assets/peices/king-b.svg";
import wK from "../assets/peices/king-w.svg";
import bN from "../assets/peices/knight-b.svg";
import wN from "../assets/peices/knight-w.svg";
import bP from "../assets/peices/pawn-b.svg";
import wP from "../assets/peices/pawn-w.svg";
import bQ from "../assets/peices/queen-b.svg";
import wQ from "../assets/peices/queen-w.svg";
import bR from "../assets/peices/rook-b.svg";
import wR from "../assets/peices/rook-w.svg";

export const pieceSVGMap: { [key: string]: string } = {
  pb: bP,
  pw: wP,
  nb: bN,
  nw: wN,
  bb: bB,
  bw: wB,
  rb: bR,
  rw: wR,
  qb: bQ,
  qw: wQ,
  kb: bK,
  kw: wK,
};
