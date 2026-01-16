import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  AuctionChessState,
  LobbyEventType,
  LobbyToPayload,
  type Lobby,
} from "shared/types";

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
  gameState: AuctionChessState,
) {
  // Supabase's httpSend mutates the payload, so we clone via Zod parse
  const payload = AuctionChessState.parse(gameState);
  return channel.httpSend(LobbyEventType.GameUpdate, payload);
}
