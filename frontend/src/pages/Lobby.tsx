import { useNavigate, useParams } from "react-router";
import useLobbies from "../hooks/useLobbies";
import Board from "../components/Board";
import Menu from "../components/Menu";
import useGame from "../hooks/useGame";
import PostGameModal from "../components/PostGameModal";
import useAuth from "../hooks/useAuth";
import useServerUpdates from "../hooks/useServerUpdates";

function Lobby() {
    const navigate = useNavigate();
    const { lobbyId } = useParams();
    const {startLobby, deleteLobby, leaveLobby} = useLobbies()

    const { game } = useGame()


    const {user, isLoading: userLoading} = useAuth()
    const {lobby} = useServerUpdates()
    const isLoading = userLoading || !lobby 


    // Last two are redundant, just to make typechecker happy
    if (isLoading || !lobby || !user) return (
        <div>Loading</div>
    )


    if (lobby.status == "active") {
        if (!game) return (
            <div>Loading</div>
        )
        const { phase, outcome } = game;
        return (
            <div className="lobby">
                {outcome && <PostGameModal />}
                <div className="game">
                    <div className={phase === "move" ? "" : "lowlight"}>
                        <Board />
                    </div>
                    <div className={phase === "bid" ? "" : "lowlight"}>
                        <Menu />
                    </div>
                </div>
            </div>
        )
    }

    return (
            <div>
                <h1>Lobby {lobbyId} </h1>
                <h2>Status: {lobby.status}</h2>
                <h2>Host: {lobby.host.username} {user!.uuid === lobby.host.uuid && (<i>(you)</i>)}</h2>
                <h2>Guest: {lobby.guest ? lobby.guest.username : (<i>none</i>)} {user!.uuid === lobby.guest?.uuid && (<i>(you)</i>)}</h2>

                {user!.uuid === lobby.host.uuid
                    ? ( 
                        // Host options
                        <div>
                            <button onClick={() => startLobby(lobbyId!)}>start lobby</button>
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

export default Lobby;