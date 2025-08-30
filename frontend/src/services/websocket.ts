import type { LobbyId, Packet } from "../schemas/types";

export function websocketFactory(
  access_token: string,
  lobbyId: LobbyId,
  onopen: (event: Event) => void,
  onmessage: (event: MessageEvent) => void,
  onclose: (event: CloseEvent) => void
): WebSocket {
  console.log("connecting to ws");

  const scheme = location.protocol === "https:" ? "wss" : "ws";
  const origin = `${scheme}://${location.host}`;
  const path = `/api/ws/lobbies/${lobbyId}`;
  const qs = new URLSearchParams({ access_token }).toString();

  // This is literally "wss://localhost/api/ws/lobbies/OERBJ?access_token=…"
  const wsUrl = `${origin}${path}?${qs}`;

  const ws = new WebSocket(wsUrl);

  ws.onopen = onopen;
  ws.onmessage = onmessage;
  ws.onclose = onclose;

  return ws;
}

export function parsePacket(text: string): Packet {
  return JSON.parse(text) as Packet;
}
