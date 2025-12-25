import type { RealtimeChannel } from "@supabase/supabase-js";
import { LobbyEventType, LobbyToPayload, type Lobby, type AuctionChessState } from "shared";

export function broadcastLobbyDelete(channel: RealtimeChannel) {
  channel.httpSend(LobbyEventType.LobbyDelete, {});
}

export function broadcastLobbyUpdate(
  channel: RealtimeChannel,
  lobby: Lobby | null,
) {
  const payload = LobbyToPayload.parse(lobby);
  channel.httpSend(LobbyEventType.LobbyUpdate, payload);
  return payload;
}

export function broadcastGameUpdate(
  channel: RealtimeChannel,
  gameState: AuctionChessState
) {
  return channel.httpSend(LobbyEventType.GameUpdate, gameState);
}
