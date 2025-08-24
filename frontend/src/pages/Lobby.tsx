import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuthContext } from "../contexts/Auth";
import { getLobby } from "../services/lobbies";
import type { LobbyProfile } from "../schemas/types";

function Lobby() {
    const navigate = useNavigate();
    const { lobbyId } = useParams();
    const { token } = useAuthContext();
    const [lobby, setLobby] = useState<LobbyProfile | null>(null);
    
    useEffect(() => {
        // TODO: Move the navigate effect into useAuthContext
        if (!token) {
            navigate("/auth");
            return;
        }

        // TODO: change LobbyId type to string
        getLobby(token, lobbyId)
        .then(
            (val: LobbyProfile) => {
                setLobby(val)
            }
        )
        .catch(
            (_: any) => {
                navigate("/lobbies")
            }
        )
    }, [lobbyId, token])

    return (
        <div>
        {lobby 
            ? (
                <div>
                    <h1>Lobby {lobbyId} </h1>
                    <h2>Status: {lobby.status}</h2>
                    <h2>Host: {lobby.host.username}</h2>
                    <h2>Guest: {lobby.guest ? lobby.guest.username : (<i>none</i>)}</h2>

                </div>
            ) 
            : (
                <div>Loading</div>
            )
        }
        </div>
    )
}

export default Lobby;