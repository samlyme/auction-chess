import { useCallback } from "react";
import type { BoardPieces, LegalMoves, Move } from "../schemas/types";
import { useServerUpdatesContext } from "../contexts/ServerUpdates";
import { sendMove } from "../services/game";
import { useAuthContext } from "../contexts/Auth";
import { useParams } from "react-router";


interface UseGameReturn {
  board: BoardPieces | null
  moves: LegalMoves | null
  makeMove: (move: Move) => void;
}

function useGame(): UseGameReturn {
  const { board, moves } = useServerUpdatesContext()
  const { token } = useAuthContext()
  const { lobbyId } = useParams()

  if (!token) throw new Error("Not authenticated")
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


  return { board, moves, makeMove };
}

export default useGame;
