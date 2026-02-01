import type { RealtimeChannel } from "@supabase/supabase-js";
import { GameContext, GameTransient, type AuctionChessState } from "shared/types/game";
import {
  LobbyEventType,
  LobbyToPayload,
  type Lobby,
} from "shared/types/lobbies";

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
  gamePayload: GameContext,
) {
  // Supabase's httpSend mutates the payload, so we clone via Zod parse
  console.log("sending realtime", gamePayload);

  return channel.httpSend(LobbyEventType.GameUpdate, gamePayload);
}
