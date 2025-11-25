import { useContext } from "react";
import useLobby from "../hooks/useLobby";
import { AuthContext } from "../contexts/Auth";
import { deleteLobby, leaveLobby } from "../services/lobbies";

export default function LobbyMenu() {
  const lobby = useLobby();
  const { user } = useContext(AuthContext);
  if (!lobby || !user) return <></>;

  return <div>
    {
      user.id === lobby.host_uid
      ? <>
        <button onClick={() => console.log("start lobby")}>start lobby</button>
        <button onClick={() => deleteLobby(lobby.code)}>delete lobby</button>
      </>
      : <>
        <button onClick={() => leaveLobby(lobby.code)}>leave lobby</button>
      </>
    }
	</div>;
}
