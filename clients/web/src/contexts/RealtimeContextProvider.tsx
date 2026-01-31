import { useEffect } from "react";
import supabase from "@/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { LobbyEventType, LobbyPayload } from "shared/types/lobbies";
import { AuctionChessStateSchema, GameContext, type AuctionChessState } from "shared/types/game";
import { RealtimeContext } from "./Realtime";

export default function RealtimeContextProvder({userId, lobbyCode, children}: {userId: string; lobbyCode: string, children: React.ReactNode}) {
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
              if (!newLobby.gameStarted) {
                // The host can end the game, and there wont be a game update.
                // That counts as a lobby update, but the game state implicitly
                // changed.
                queryClient.setQueryData(["game"], null);
              } else {
                // The lobby's game as now started. The game state cache
                // is no longer valid. This query is not invalidated during
                // game updates though, so it is still efficient.
                queryClient.invalidateQueries({ queryKey: ["game"] });
              }
            } else {
              console.log("left lobby");
              queryClient.setQueryData(["lobby"], null);
              queryClient.setQueryData(["game"], null);
            }
            break;
          }

          case LobbyEventType.LobbyDelete:
            queryClient.setQueryData(["lobby"], null);
            queryClient.setQueryData(["game"], null);
            console.log("lobby deleted");
            break;

          case LobbyEventType.GameUpdate: {
            const {game, log} = GameContext.parse(update.payload);
            queryClient.setQueryData(["game"], game);
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
  return <RealtimeContext value={{enabled: true}}>{children}</RealtimeContext>;
}
