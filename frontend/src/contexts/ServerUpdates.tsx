import { createContext } from "react";
import type { Color, Balances, BoardPieces, GamePhase, LegalMoves, LobbyProfile, Players, GameOutcome } from "../schemas/types";

// TODO: Refactor this to just be the gamepacket or null type
export interface ServerUpdatesContextType {
    lobby: LobbyProfile | null
    
    phase: GamePhase
    turn: Color 

    outcome: GameOutcome

    prevBid: number

    board: BoardPieces | null
    moves: LegalMoves | null
    
    players: Players | null
    balances: Balances | null
}

export const ServerUpdatesContext = createContext<ServerUpdatesContextType | null>(null);