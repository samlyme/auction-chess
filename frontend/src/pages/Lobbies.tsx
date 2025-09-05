import { useEffect, useState } from "react";
import type { LobbyProfile } from "../schemas/types";
import { useNavigate } from "react-router";
import useLobbies from "../hooks/useLobbies";

function Lobbies() {
    const navigate = useNavigate();

    const [lobbyId, setLobbyId] = useState("");

    const {userLobby, createLobby, joinLobby} = useLobbies()

    useEffect(() => {

        userLobby()
        .then(
            (lobby: LobbyProfile | null) => {
                if (lobby) {
                    console.log("user lobby", lobby);
                    navigate(`/lobbies/${lobby.id}`)
                }
            }
        )
    }, [navigate, userLobby])

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();

        joinLobby(lobbyId)
        .then((res: LobbyProfile) => {
            console.log("Joined lobby:", res);
            navigate(`/lobbies/${res.id}`)
        })
        .catch((err) => {
            console.error("Error joining lobby:", err);
        });

        console.log("Joining lobby with ID:", lobbyId);

    }

    const handleCreate = () => {
        createLobby()
        .then((res: LobbyProfile | null) => {
            console.log("Created lobby:", res);
            if (res) {
                navigate(`/lobbies/${res.id}`)
            }
        })
    }

    return (
        <div>
            <h1>Create Lobby</h1>
            <button onClick={handleCreate}>Create Lobby</button>

            <h1>Join Lobby</h1>
            <form onSubmit={handleJoin}>
                <div>
                    <label htmlFor="lobbyId">Lobby ID:</label>
                    <input 
                        type="text" 
                        id="lobbyId" 
                        name="lobbyId" 
                        value={lobbyId}
                        onChange={e => setLobbyId(e.target.value)}
                    />
                </div>
                <button type="submit">Join</button>
            </form>
        </div>
    )
} 

export default Lobbies;