import { useContext, useEffect, useState } from "react";
import {
  AuctionChessState,
  LobbyEventType,
  LobbyPayload,
} from "shared";
import { getLobby } from "../services/lobbies";
import { getGame } from "../services/game";
import supabase from "../supabase";
import { AuthContext } from "../contexts/Auth";

export interface RealtimeType {
  lobby: LobbyPayload;
  gameState: AuctionChessState;
  loading: boolean;
}

export default function useRealtime() {
  const [lobby, setLobby] = useState<LobbyPayload | null>(null);
  const [gameState, setGameState] = useState<AuctionChessState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    getLobby()
      .then((lobby) => {
        setLobby(lobby);
      })
      .catch((err) => {
        setError(err);
        console.log("getLobby Error", err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!lobby) return;
    if (!lobby.gameStarted) {
      setGameState(null);
    } else {
      getGame()
        .then((state) => {
          setGameState(state);
        })
        .catch((err) => {
          setError(err);
          console.log("getGame Error", err);
        });
    }
  }, [lobby?.gameStarted]);

  useEffect(() => {
    if (loading || error || !lobby) return;

    console.log("sub to realtime", { loading, error, lobby });
    const channel = supabase.channel(`lobby-${lobby.code}`);

    channel
      .on("broadcast", { event: "*" }, (update) => {
        console.log("real time", update);

        switch (update.event) {
          case LobbyEventType.LobbyUpdate:
            const newLobby = LobbyPayload.parse(update.payload);
            console.log("newLobby", newLobby);

            if (
              user?.id &&
              (user.id === newLobby.hostUid || user.id === newLobby.guestUid)
            ) {
              setLobby(newLobby);
            }
            else {
              console.log("left lobby");
              setLobby(null);
            }
            break;

          case LobbyEventType.LobbyDelete:
            setLobby(null);
            console.log("lobby deleted");
            break;

          case LobbyEventType.GameUpdate:
            const newGameState = AuctionChessState.parse(update.payload);
            setGameState(newGameState);
            break;
        }
      })
      .subscribe();

    return () => {
      console.log("unsub from realtime");

      channel.unsubscribe();
    };
  }, [lobby?.code, loading, error]);

  return { lobby, gameState, loading, setLobby };
}
