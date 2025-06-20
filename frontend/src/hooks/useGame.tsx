import { useState, useEffect, useCallback, useRef } from "react";
import type { Game, Move } from "../lib/types";

const WS_URL = `ws://localhost:8000/game/1`;

interface UseGameReturn {
  game: Game | undefined;
  makeMove: (move: Move) => void;
  isConnected: boolean;
  error: string | null;
}

function useGame(): UseGameReturn {
  const [game, setGame] = useState<Game>();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);

  const makeMove = useCallback((move: Move): void => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        console.log("making move: ", move);

        ws.current.send(JSON.stringify(move));
      } catch (err) {
        console.error("Failed to send message:", err);
        setError("Failed to send message.");
      }
    } else {
      console.warn("WebSocket is not open. Message not sent:", move);
      setError("Connection not open to send message.");
    }
  }, []);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    ws.current.onmessage = (event: MessageEvent) => {
      try {
        const newGame: Game = JSON.parse(event.data) as Game;
        setGame(newGame);
      } catch (err) {
        console.error("Failed to parse message:", event.data, err);
        setError("Failed to parse incoming message.");
      }
    };

    ws.current.onerror = (err: Event) => {
      console.error("WebSocket error:", err);
      setIsConnected(false);
      setError("WebSocket connection error.");
    };

    ws.current.onclose = (event: CloseEvent) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      setIsConnected(false);
      setError("WebSocket disconnected.");
      // Optional: Implement a reconnect strategy here if needed
    };

    // 2. Clean-up function when the component unmounts
    return () => {
      if (ws.current) {
        console.log("Closing WebSocket connection...");
        ws.current.close();
      }
    };
  }, []);

  return { game, makeMove, isConnected, error };
}

export default useGame;
