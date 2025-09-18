import { useNavigate, useParams } from "react-router";
import useGame from "../hooks/useGame";
import useLobbies from "../hooks/useLobbies";
import useAuth from "../hooks/useAuth";
import useServerUpdates from "../hooks/useServerUpdates";

function PostGameModal() {
    const { game, userColor } = useGame()

    if (!game || !game.outcome) throw new Error("PostGameModal only to be used after outcome.")
    
    const { user } = useAuth()
    const {startLobby, deleteLobby, leaveLobby} = useLobbies()
    const { lobby } = useServerUpdates()
    const { lobbyId } = useParams()

    const navigate = useNavigate()

    let title: string = ""
    if (game.outcome == "draw") title = "Draw."
    else if (game.outcome == userColor) title = "You win."
    else title = "You lose."

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