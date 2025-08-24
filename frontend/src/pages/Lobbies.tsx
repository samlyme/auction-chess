import { useState } from "react";
import { useAuthContext } from "../contexts/Auth";
import { createLobby, joinLobby } from "../services/lobbies";
import type { LobbyProfile } from "../schemas/types";
import { useNavigate } from "react-router";

function Lobbies() {

    const [lobbyId, setLobbyId] = useState("");
    const { token } = useAuthContext();
    const navigate = useNavigate();
    if (!token) navigate("/auth");
    console.log("token in lobbies", token);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();

        joinLobby(token || "", lobbyId)
        .then((res: LobbyProfile) => {
            console.log("Joined lobby:", res);
        })
        .catch((err) => {
            console.error("Error joining lobby:", err);
        });

        console.log("Joining lobby with ID:", lobbyId);

    }

    const handleCreate = () => {
        createLobby(token!)
        .then((res: LobbyProfile) => {
            console.log("Created lobby:", res);
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