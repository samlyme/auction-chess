import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import useLobbies from '../../hooks/useLobbies';
import type { GameData, LobbyProfile, Packet } from '../../schemas/types';
import useAuth from '../../hooks/useAuth';
import {
  ServerUpdatesContext,
  type ServerUpdatesContextType,
} from '../../contexts/ServerUpdates';
import { parsePacket, websocketFactory } from '../../services/websocket';

export function ServerUpdatesProvider({
  lobbyId,
  children,
}: {
  lobbyId: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { getLobby } = useLobbies();
  const [lobby, setLobby] = useState<LobbyProfile | null>(null);
  const [game, setGame] = useState<GameData | null>(null);

  const { token } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    getLobby(lobbyId)
      .then((val: LobbyProfile) => {
        setLobby(val);

        const onopen = (event: Event) => {
          console.log('🟢 WS connected', event);
        };

        const onmessage = (event: MessageEvent) => {
          const data: Packet = parsePacket(event.data);
          console.log('Packet', event.data);

          if (data.type == 'lobby_packet') {
            setLobby(data.content);
          } else if (data.type == 'game_packet') {
            setGame(data.content);
          }
        };

        const onclose = (event: CloseEvent) => {
          console.log('🔴 WS Closed', event);
          navigate('/lobbies');
        };
        wsRef.current = websocketFactory(
          token!,
          lobbyId,
          onopen,
          onmessage,
          onclose
        );
      })
      .catch(() => navigate('/lobbies'));
    // This UE should only run once and is practically "global".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const context: ServerUpdatesContextType = { lobby, game };

  return (
    <ServerUpdatesContext value={context}>{children}</ServerUpdatesContext>
  );
}
