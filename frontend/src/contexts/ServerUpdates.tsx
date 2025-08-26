import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { LobbyProfile, Packet } from "../schemas/types";
import useLobbies from "../hooks/useLobbies";
import { useNavigate } from "react-router";
import { parsePacket, websocketFactory } from "../services/websocket"
import { useAuthContext } from "./Auth";

interface ServerUpdatesContextType {
    lobby: LobbyProfile | null
}

const ServerUpdatesContext = createContext<ServerUpdatesContextType | null>(null);

interface ServerUpdatesProps {
    lobbyId: string
    children: ReactNode
}

export function ServerUpdatesProvider({ lobbyId, children }: ServerUpdatesProps) {
    const navigate = useNavigate()
    const { getLobby } = useLobbies()
    const [lobby, setLobby] = useState<LobbyProfile | null>(null)
    const {token} = useAuthContext()
    const wsRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        getLobby(lobbyId)
        .then(
            (val: LobbyProfile) => {
                setLobby(val)

                const onopen = (event: Event) => {
                    console.log("🟢 WS connected", event)
                }

                const onmessage = (event: MessageEvent) => {
                    console.log("🟡 Message Received", event);
                    // TODO: Parse and "dispatch"
                    const data: Packet = parsePacket(event.data)
                    console.log("Attempting to parse packet", data);
                    
                    if (data.type == "lobby_packet") setLobby(data.content)
                }

                const onclose = (event: CloseEvent) => {
                    console.log("🔴 WS Closed", event);
                    navigate("/lobbies")
                }
                wsRef.current = websocketFactory(token!, lobbyId, onopen, onmessage, onclose)
            }
        )
        .catch(() => navigate("/lobbies"))
    }, [])

    const context: ServerUpdatesContextType = { lobby }

    return (
        <ServerUpdatesContext value={context}>
            {children}
        </ServerUpdatesContext>
    )
}

export function useServerUpdatesContext(): ServerUpdatesContextType {
    const out = useContext(ServerUpdatesContext);
    if (!out) throw Error("useServerUpdatesContext must be used within an erverUpdatesProvider")
    return out;
}