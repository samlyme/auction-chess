import type { LobbyId } from "../schemas/types";

export function websocketFactory(
  access_token: string,
  lobbyId: LobbyId
): WebSocket {
  console.log("connecting to ws");

  let url = `/api/ws/lobbies/${lobbyId}`;
  const qp = new URLSearchParams({ access_token });
  url += `?${qp.toString()}`;
  const ws = new WebSocket(url);
  ws.onopen = () => {
    console.log("🟢 WebSocket connected");
  };

  ws.onmessage = (event: MessageEvent) => {
    console.log(event.data);
  };

  return ws;
}
