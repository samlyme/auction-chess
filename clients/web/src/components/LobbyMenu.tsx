import { useContext } from "react";
import { AuthContext } from "../contexts/Auth";
import { deleteLobby, leaveLobby } from "../services/lobbies";
import { LobbyContext } from "../contexts/Lobby";

export default function LobbyMenu() {
  const { lobby, update } =  useContext(LobbyContext);
  const { user } = useContext(AuthContext);
  if (!lobby || !user) return <></>;

  return (
    <div>
      {user.id === lobby.host_uid ? (
        <>
          <button onClick={() => console.log("start lobby")}>
            start lobby
          </button>
          <button onClick={() => deleteLobby(lobby.code)}>delete lobby</button>
        </>
      ) : (
        <>
          <button onClick={() => leaveLobby(lobby.code).then(() => update(null))}>leave lobby</button>
        </>
      )}
    </div>
  );
}
