import { useEffect, useState } from "react";
import { AuctionChessState, LobbyEventType, LobbyPayload } from "shared";
import { getGame } from "../services/game";
import supabase from "../supabase";
import type { User } from "@supabase/supabase-js";

// export interface RealtimeType {
//   lobby: LobbyPayload;
//   gameState: AuctionChessState;
//   loading: boolean;
// }

// provide all initial values. Thus, this hook's only responsibility is to
// list for updates. However, that means it still does the logic for fetching
// initial gameState.
// This route sets lobby to null when a DELETE message is received.
export default function useRealtime(
  user: User,
  initLobby: LobbyPayload,
  initGameState: AuctionChessState | null,
) {
  const [lobby, setLobby] = useState<LobbyPayload | null>(initLobby);
  const [gameState, setGameState] = useState<AuctionChessState | null>(initGameState);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  // One redunant getGame call to start.
  useEffect(() => {
    if (!lobby) return;

    if (!lobby.gameStarted) {
       
      setGameState(null);
    } else {
      getGame()
        .then((res) => {
          if (!res.ok) setError(res.error);
          else setGameState(res.value);
        })
        .finally(() => setLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
            { const newLobby = LobbyPayload.parse(update.payload);
            console.log("newLobby", newLobby);

            if (
              user?.id &&
              (user.id === newLobby.hostUid || user.id === newLobby.guestUid)
            ) {
              setLobby(newLobby);
            } else {
              console.log("left lobby");
              setLobby(null);
            }
            break; }

          case LobbyEventType.LobbyDelete:
            setLobby(null);
            console.log("lobby deleted");
            break;

          case LobbyEventType.GameUpdate:
            { const newGameState = AuctionChessState.parse(update.payload);
            setGameState(newGameState);
            break; }
        }
      })
      .subscribe();

    return () => {
      console.log("unsub from realtime");

      channel.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobby?.code, loading, error]);

  return { lobby, gameState, loading, setLobby, setGameState };
}
