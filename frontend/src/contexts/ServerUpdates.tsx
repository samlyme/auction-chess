import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Color, Balances, BoardPieces, GamePhase, LegalMoves, LobbyProfile, Packet, Players } from "../schemas/types";
import useLobbies from "../hooks/useLobbies";
import { useNavigate } from "react-router";
import { parsePacket, websocketFactory } from "../services/websocket"
import { useAuthContext } from "./Auth";

interface ServerUpdatesContextType {
    lobby: LobbyProfile | null
    
    phase: GamePhase
    turn: Color 

    board: BoardPieces | null
    moves: LegalMoves | null
    
    players: Players | null
    balances: Balances | null
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
    const [board, setBoard] = useState<BoardPieces | null>(null)
    const [moves, setMoves] = useState<LegalMoves | null>(null)

    const [players, setPlayers] = useState<Players | null>(null)
    const [balances, setBalances] = useState<Balances | null>(null)

    const [phase, setPhase] = useState<GamePhase>("bid")
    const [turn, setTurn] = useState<Color>("w")

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
                    const data: Packet = parsePacket(event.data)
                    
                    if (data.type == "lobby_packet") {
                        setLobby(data.content)
                    }
                    else if (data.type == "game_packet") {
                        setPhase(data.phase)
                        setTurn(data.turn)

                        setBoard(data.board)
                        setMoves(data.moves)
                        
                        setPlayers(data.players)
                        setBalances(data.balances)
                    }
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

    const context: ServerUpdatesContextType = { lobby, phase, turn, board, moves, players, balances }

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