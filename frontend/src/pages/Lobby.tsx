import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { LobbyProfile, UserProfile } from "../schemas/types";
import useLobbies from "../hooks/useLobbies";
import useUser from "../hooks/useUser";

function Lobby() {
    const navigate = useNavigate();
    const { lobbyId } = useParams();
    const [lobby, setLobby] = useState<LobbyProfile | null>(null);

    const {getLobby, deleteLobby} = useLobbies();
    const user = useUser() as UserProfile


    useEffect(() => {
        // Redundant, but needed for type checker to be happy
        if (!lobbyId) {
            throw new Error("missing lobbyId param")
        }

        // TODO: Move service calls to hooks
        getLobby(lobbyId)
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
    }, [lobbyId])

    return (
        <div>
        {lobby 
            ? (
                <div>
                    <h1>Lobby {lobbyId} </h1>
                    <h2>Status: {lobby.status}</h2>
                    <h2>Host: {lobby.host.username}</h2>
                    <h2>Guest: {lobby.guest ? lobby.guest.username : (<i>none</i>)}</h2>

                    {user.uuid === lobby.host.uuid
                        ? ( 
                            // Host options
                            <div>
                                <button>start game</button>
                                <button>delete lobby</button>
                            </div>
                        )
                        : (
                            // Guest options
                            <div>
                                <button>leave lobby</button>
                            </div>
                        )
                    }
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