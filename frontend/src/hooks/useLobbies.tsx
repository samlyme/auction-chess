import { useNavigate } from "react-router";
import { useAuthContext } from "../contexts/Auth";
import type { LobbyId, LobbyProfile } from "../schemas/types";
import * as LobbyServices from "../services/lobbies";
import { useEffect } from "react";

interface UseLobbyReturn {
    userLobby: () => Promise<LobbyProfile | null>
    getLobby: (lobbyId: LobbyId) => Promise<LobbyProfile>
    createLobby: () => Promise<LobbyProfile | null>
    joinLobby: (lobbyId: LobbyId) => Promise<LobbyProfile>
    deleteLobby: (lobbyId: LobbyId) => Promise<void>
}

function useLobbies(): UseLobbyReturn {
    const { token } = useAuthContext(); // notice that we need to use this hook in auth context
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) {
            navigate("/auth")
        }
    }, [token, navigate])

    // make type checker happy
    if (!token) {
        return {
        userLobby:   async () => null,
        getLobby:    async () => { throw new Error("no auth") },
        createLobby: async () => null,
        joinLobby:   async () => { throw new Error("no auth") },
        deleteLobby: async () => {},
        }
    }

    const userLobby = () => LobbyServices.userLobby(token)
    const getLobby = (lobbyId: LobbyId) => LobbyServices.getLobby(token, lobbyId)
    const createLobby = () => LobbyServices.createLobby(token)
    const joinLobby = (lobbyId: LobbyId) => LobbyServices.joinLobby(token, lobbyId)
    const deleteLobby = (lobbyId: LobbyId) => LobbyServices.deleteLobby(token, lobbyId)

    return { userLobby, getLobby, createLobby, joinLobby, deleteLobby }
}

export default useLobbies;