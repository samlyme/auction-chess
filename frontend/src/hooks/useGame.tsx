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
  userBalance: number
}

function useGame(): UseGameReturn {
  const { board, moves, players, balances } = useServerUpdatesContext()
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


  if (!players || !balances) return { board, moves, makeMove, userColor: "w", userBalance: 0}

  if (user.uuid !== players.w && user.uuid !== players.b) throw new Error("User not in right game.")

  const userColor: Color = user.uuid == players.w ? "w" : "b";
  const userBalance: number = user.uuid == players.w ? balances.w : balances.b

  return { board, moves, makeMove, userColor, userBalance };
}

export default useGame;
