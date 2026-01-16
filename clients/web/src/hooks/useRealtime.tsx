import { useEffect } from "react";
import { AuctionChessState, LobbyEventType, LobbyPayload } from "shared/types";
import supabase from "@/supabase";
import { useQueryClient } from "@tanstack/react-query";

// provide all initial values. Thus, this hook's only responsibility is to
// list for updates. However, that means it still does the logic for fetching
// initial gameState.
// This route sets lobby to null when a DELETE message is received.
export default function useRealtime(userId: string, lobbyCode: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("sub to realtime");
    const channel = supabase.channel(`lobby-${lobbyCode}`);

    channel
      .on("broadcast", { event: "*" }, (update) => {
        console.log("real time", update);

        switch (update.event) {
          case LobbyEventType.LobbyUpdate: {
            const newLobby = LobbyPayload.parse(update.payload);
            console.log("newLobby", newLobby);

            if (userId === newLobby.hostUid || userId === newLobby.guestUid) {
              console.log("update lobby");

              queryClient.setQueryData(["lobby"], newLobby);
              if (!newLobby.gameStarted)
                queryClient.setQueryData(["game"], null);
            } else {
              console.log("left lobby");
              queryClient.setQueryData(["lobby"], null);
            }
            break;
          }

          case LobbyEventType.LobbyDelete:
            queryClient.setQueryData(["lobby"], null);
            console.log("lobby deleted");
            break;

          case LobbyEventType.GameUpdate: {
            const newGameState = AuctionChessState.parse(update.payload);
            queryClient.setQueryData(["game"], newGameState);
            break;
          }
        }
      })
      .subscribe();

    return () => {
      console.log("unsub from realtime");

      channel.unsubscribe();
    };
  }, []);
}
