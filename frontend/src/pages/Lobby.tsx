import { useNavigate, useParams } from "react-router";
import { useAuthContext } from "../contexts/Auth";
import { useServerUpdatesContext } from "../contexts/ServerUpdates";
import useLobbies from "../hooks/useLobbies";
import Board from "../components/Board";
import Menu from "../components/Menu";

function Lobby() {
    const navigate = useNavigate();
    const { lobbyId } = useParams();
    const {startLobby, deleteLobby, leaveLobby} = useLobbies()

    function getData() {
        const {user, isLoading: userLoading} = useAuthContext()
        const { lobby } = useServerUpdatesContext()

        const isLoading = userLoading || !lobby
        
        return { isLoading, user, lobby}
    }

    const {isLoading, user, lobby} = getData()

    // Last two are redundant, just to make typechecker happy
    if (isLoading || !lobby || !user) return (
        <div>Loading</div>
    )

    if (lobby.status == "active") return (
        <div className="game">
            <Board />
            <Menu />
        </div>
    )

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