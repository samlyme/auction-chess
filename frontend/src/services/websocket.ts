import type { LobbyId } from "../schemas/types";

export function websocketFactory(
  access_token: string,
  lobbyId: LobbyId
): WebSocket {
  console.log("connecting to ws");

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  // build URL, append token if needed
  let url = `/api/lobbies/${lobbyId}/ws`;
  const qp = new URLSearchParams({ access_token });
  url += `?${qp.toString()}`;
  const ws = new WebSocket(url);
  ws.onopen = () => {
    console.log("🟢 WebSocket connected");
  };

  ws.onmessage = (event: MessageEvent) => {
    // event.data is string | Blob | ArrayBuffer depending on server + binaryType
    console.log(event.data);
    
  };

  return ws;
}
