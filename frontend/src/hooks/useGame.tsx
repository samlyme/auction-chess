import { useCallback } from "react";
import type {
  Bid,
  Color,
  GameData,
  Move,
} from "../schemas/types";
import { sendBid, sendMove } from "../services/game";
import { useParams } from "react-router";
import useAuth from "./useAuth";
import useServerUpdates from "./useServerUpdates";

interface UseGameReturn {
  makeMove: (move: Move) => void;
  makeBid: (bid: Bid) => void;
  game: GameData | null;
  userColor: Color | null;
}

function useGame(): UseGameReturn {
  const { game } = useServerUpdates();

  const { token, user } = useAuth();
  const { lobbyId } = useParams();

  if (!lobbyId) throw new Error("Not in lobby");

  const makeMove = useCallback((move: Move): void => {
    console.log("Making move", move);
    sendMove(token!, lobbyId, move)
      .then((res: unknown) => {
        console.log("Sent move", res);
      })
      .catch((reason: unknown) => {
        console.log("Failed to make move", reason);
      });
  }, [lobbyId, token]);

  const makeBid = useCallback((bid: Bid): void => {
    console.log("Making bid", bid);
    sendBid(token!, lobbyId, bid)
      .then((res: unknown) => {
        console.log("Sent bid", res);
      })
      .catch((reason: unknown) => {
        console.log("Failed to make bid", reason);
      });
  }, [lobbyId, token]);

  if (game && user) return {makeMove, makeBid, game, userColor: user.uuid === game.players.w.uuid ? "w" : "b"}

  return {makeMove, makeBid, game, userColor: null}
}

export default useGame;