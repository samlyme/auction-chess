import { useEffect } from 'react';
import { AuctionChessState, LobbyEventType, LobbyPayload } from 'shared';
import supabase from '../supabase';

// provide all initial values. Thus, this hook's only responsibility is to
// list for updates. However, that means it still does the logic for fetching
// initial gameState.
// This route sets lobby to null when a DELETE message is received.
export default function useRealtime(
  userId: string,
  lobbyCode: string,
  setLobby: React.Dispatch<React.SetStateAction<LobbyPayload | null>>,
  setGameState: React.Dispatch<React.SetStateAction<AuctionChessState | null>>
) {
  useEffect(() => {
    console.log('sub to realtime' );
    const channel = supabase.channel(`lobby-${lobbyCode}`);

    channel
      .on('broadcast', { event: '*' }, (update) => {
        console.log('real time', update);

        switch (update.event) {
          case LobbyEventType.LobbyUpdate: {
            const newLobby = LobbyPayload.parse(update.payload);
            console.log('newLobby', newLobby);

            if (userId === newLobby.hostUid || userId === newLobby.guestUid){
              console.log("update lobby");
              
              setLobby(newLobby);
            } else {
              console.log('left lobby');
              setLobby(null);
            }
            break;
          }

          case LobbyEventType.LobbyDelete:
            setLobby(null);
            console.log('lobby deleted');
            break;

          case LobbyEventType.GameUpdate: {
            const newGameState = AuctionChessState.parse(update.payload);
            setGameState(newGameState);
            break;
          }
        }
      })
      .subscribe();

    return () => {
      console.log('unsub from realtime');

      channel.unsubscribe();
    };
  }, []);
}
