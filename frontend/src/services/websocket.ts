import type { LobbyId } from "../schemas/types";

export function websocketFactory(access_token: string, lobbyId: LobbyId): WebSocket {
    console.log("connecting to ws");
    
    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    // build URL, append token if needed
    let url = `${protocol}://localhost:8000/lobbies/${lobbyId}/ws`
    const qp = new URLSearchParams({ access_token })
    url += `?${qp.toString()}`

    return new WebSocket(url)
}