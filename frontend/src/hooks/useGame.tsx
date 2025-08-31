import { useCallback } from "react";
import type {
  BoardPieces,
  Color,
  GameOutcome,
  GamePhase,
  LegalMoves,
  Move,
} from "../schemas/types";
import { sendBid, sendMove } from "../services/game";
import { useParams } from "react-router";
import { useAuth } from "./useAuth";
import { useServerUpdates } from "./useServerUpdates";

interface UseGameReturn {
  board: BoardPieces | null;
  moves: LegalMoves | null;
  makeMove: (move: Move) => void;
  makeBid: (amount: number) => void;
  prevBid: number;
  outcome: GameOutcome;
  userColor: Color;
  opponentColor: Color;
  userBalance: number;
  opponentBalance: number;
  phase: GamePhase;
  turn: Color;
}

function useGame(): UseGameReturn {
  const { board, moves, outcome, players, prevBid, balances, phase, turn } =
    useServerUpdates();
  const { token, user } = useAuth();
  const { lobbyId } = useParams();

  if (!lobbyId) throw new Error("Not in lobby");

  const makeMove = useCallback((move: Move): void => {
    console.log("Making move", move);
    sendMove(token!, lobbyId, move)
      .then((res: any) => {
        console.log("Sent move", res);
      })
      .catch((reason: any) => {
        console.log("Failed to make move", reason);
      });
  }, []);

  const makeBid = useCallback((amount: number): void => {
    console.log("Making bid", amount);
    sendBid(token!, lobbyId, { amount })
      .then((res: any) => {
        console.log("Sent bid", res);
      })
      .catch((reason: any) => {
        console.log("Failed to make bid", reason);
      });
  }, []);

  if (!players || !balances)
    return {
      board,
      moves,
      makeMove,
      makeBid,
      outcome,
      prevBid,
      userColor: "w",
      userBalance: 0,
      opponentColor: "b",
      opponentBalance: 0,
      phase,
      turn,
    };

  if (user!.uuid !== players.w && user!.uuid !== players.b)
    throw new Error("User not in right game.");

  const userColor: Color = user!.uuid == players.w ? "w" : "b";
  const opponentColor: Color = user!.uuid == players.w ? "b" : "w";

  const userBalance: number = user!.uuid == players.w ? balances.w : balances.b;
  const opponentBalance: number =
    user!.uuid == players.w ? balances.b : balances.w;

  return {
    board,
    moves,
    makeMove,
    makeBid,
    outcome,
    prevBid,
    userColor,
    opponentColor,
    userBalance,
    opponentBalance,
    phase,
    turn,
  };
}

export default useGame;