import { useContext, useEffect, useState } from "react";
import {
  AuctionChessState,
  LobbyEventType,
  LobbyPayload,
  type Result,
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
      .then((res: Result<LobbyPayload | null>) => {
        if (!res.ok) {
          setError(res.error);
          console.log("getLobby Error", res.error);
        } else {
          setLobby(res.value);
        }
      })
      .then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!lobby) return;
    if (!lobby.game_started) {
      setGameState(null);
    } else
      getGame().then((res) => {
        if (!res.ok) {
          setError(res.error);
          console.log("getGame Error", res.error);
        } else setGameState(res.value);
      });
  }, [lobby?.game_started]);

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
              (user.id === newLobby.host_uid || user.id === newLobby.guest_uid)
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
  }, [loading, error]);

  return { lobby, gameState, loading };
}
