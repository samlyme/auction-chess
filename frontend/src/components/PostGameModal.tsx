import { useNavigate, useParams } from "react-router";
import { useServerUpdatesContext } from "../contexts/ServerUpdates";
import useGame from "../hooks/useGame";
import useLobbies from "../hooks/useLobbies";
import { useAuth } from "../hooks/useAuth";

function PostGameModal() {
    const { outcome, userColor } = useGame()
    const { user } = useAuth()
    const {startLobby, deleteLobby, leaveLobby} = useLobbies()
    const { lobby } = useServerUpdatesContext()
    const { lobbyId } = useParams()

    const navigate = useNavigate()

    if (outcome == "pending") throw new Error("Modal only for finished games")

        let title: string = ""
        if (outcome == "draw") title = "Draw."
        else if (outcome == userColor) title = "You lose."
        else title = "You win."
    return (
        <div className="modal">
            <h1>{title}</h1>
            {user!.uuid === lobby!.host.uuid
                ? ( 
                    // Host options
                    <div>
                        <button onClick={() => startLobby(lobbyId!)}>New Game</button>
                        <button onClick={() => deleteLobby(lobbyId!).then(() => navigate("/lobbies"))}>delete lobby</button>
                    </div>
                )
                : (
                    // Guest options
                    <div>
                        <button onClick={() => leaveLobby(lobbyId!).then(() => navigate("/lobbies"))}>leave lobby</button>
                    </div>
                )
            }
        </div>
    )
}

export default PostGameModal;