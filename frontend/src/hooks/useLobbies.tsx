import { useAuthContext } from "../contexts/Auth";
import type { LobbyId, LobbyProfile } from "../schemas/types";
import * as LobbyServices from "../services/lobbies";

interface UseLobbyReturn {
    userLobby: () => Promise<LobbyProfile | null>
    getLobby: (lobbyId: LobbyId) => Promise<LobbyProfile>
    createLobby: () => Promise<LobbyProfile | null>
    joinLobby: (lobbyId: LobbyId) => Promise<LobbyProfile>
    deleteLobby: (lobbyId: LobbyId) => Promise<void>
}

function useLobbies(): UseLobbyReturn {
    const { token } = useAuthContext(); // notice that we need to use this hook in auth context
    if (!token) throw new Error("auth token missing in useLobbies hook")

    const userLobby = () => LobbyServices.userLobby(token)
    const getLobby = (lobbyId: LobbyId) => LobbyServices.getLobby(token, lobbyId)
    const createLobby = () => LobbyServices.createLobby(token)
    const joinLobby = (lobbyId: LobbyId) => LobbyServices.joinLobby(token, lobbyId)
    const deleteLobby = (lobbyId: LobbyId) => LobbyServices.deleteLobby(token, lobbyId)

    return { userLobby, getLobby, createLobby, joinLobby, deleteLobby }
}

export default useLobbies;