import type { LobbyId, Packet } from "../schemas/types";

export function websocketFactory(
  access_token: string,
  lobbyId: LobbyId,
  onopen: (event: Event) => void,
  onmessage: (event: MessageEvent) => void,
  onclose: (event: CloseEvent) => void,
): WebSocket {
  console.log("connecting to ws");

  let url = `/api/ws/lobbies/${lobbyId}`;
  const qp = new URLSearchParams({ access_token });
  url += `?${qp.toString()}`;
  const ws = new WebSocket(url);

  ws.onopen = onopen
  ws.onmessage = onmessage
  ws.onclose = onclose

  return ws;
}

export function parsePacket(text: string): Packet {
  return JSON.parse(text) as Packet
}