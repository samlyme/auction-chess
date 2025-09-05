import { useEffect, useRef, useState, type ReactNode } from "react"
import { useNavigate } from "react-router"
import useLobbies from "../../hooks/useLobbies"
import type { Balances, BoardPieces, Color, GameOutcome, GamePhase, LegalMoves, LobbyProfile, Packet, Players } from "../../schemas/types"
import { useAuth } from "../../hooks/useAuth"
import { ServerUpdatesContext, type ServerUpdatesContextType } from "../../contexts/ServerUpdates"
import { parsePacket, websocketFactory } from "../../services/websocket"


export function ServerUpdatesProvider({ lobbyId, children }: {
    lobbyId: string
    children: ReactNode
}) {
    const navigate = useNavigate()
    const { getLobby } = useLobbies()
    const [lobby, setLobby] = useState<LobbyProfile | null>(null)
    const [board, setBoard] = useState<BoardPieces | null>(null)
    const [moves, setMoves] = useState<LegalMoves | null>(null)

    const [players, setPlayers] = useState<Players | null>(null)
    const [balances, setBalances] = useState<Balances | null>(null)

    const [outcome, setOutcome] = useState<GameOutcome>("pending")

    const [phase, setPhase] = useState<GamePhase>("bid")
    const [turn, setTurn] = useState<Color>("w")

    const [prevBid, setPrevBid] = useState<number>(0)

    const {token} = useAuth()
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
                    console.log("Packet", event.data);
                    
                    
                    if (data.type == "lobby_packet") {
                        setLobby(data.content)
                    }
                    else if (data.type == "game_packet") {
                        setPhase(data.phase)
                        setTurn(data.turn)

                        setOutcome(data.outcome)

                        setPrevBid(data.prev_bid)

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
    // This UE should only run once and is practically "global".
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const context: ServerUpdatesContextType = { lobby, phase, turn, outcome, board, moves, prevBid, players, balances }

    return (
        <ServerUpdatesContext value={context}>
            {children}
        </ServerUpdatesContext>
    )
}