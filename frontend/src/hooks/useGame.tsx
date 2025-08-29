import { useCallback } from "react";
import type { BoardPieces, Color, LegalMoves, Move } from "../schemas/types";
import { useServerUpdatesContext } from "../contexts/ServerUpdates";
import { sendMove } from "../services/game";
import { useAuthContext } from "../contexts/Auth";
import { useParams } from "react-router";


interface UseGameReturn {
  board: BoardPieces | null
  moves: LegalMoves | null
  makeMove: (move: Move) => void;
  userColor: Color
}

function useGame(): UseGameReturn {
  const { board, moves, white, black } = useServerUpdatesContext()
  const { token, user } = useAuthContext()
  const { lobbyId } = useParams()

  if (!token || !user) throw new Error("Not authenticated")
  if (!lobbyId) throw new Error("Not in lobby")

  const makeMove = useCallback((move: Move): void => {
    console.log("Making move", move);
    sendMove(token, lobbyId, move)
    .then((res: any) => {
      console.log("Sent move", res);
    }) 
    .catch((reason: any) => {
      console.log("Failed to make move", reason);
    })
  }, []);

  if (user.uuid !== white && user.uuid !== black) throw new Error("User not in right game.")

  const userColor: Color = user.uuid == white ? "w" : "b";

  return { board, moves, makeMove, userColor };
}

export default useGame;
