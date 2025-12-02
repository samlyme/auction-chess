import { useContext } from "react";
import { AuthContext } from "../contexts/Auth";
import { deleteLobby, leaveLobby, startLobby } from "../services/lobbies";
import type { Lobby } from "shared";

export default function LobbyMenu({
  lobby,
  update,
}: {
  lobby: Lobby;
  update: (lobby?: Lobby | null) => void;
}) {
  const { user } = useContext(AuthContext);
  if (!lobby || !user) return <h1>Loading</h1>;

  const handleStartLobby = async () => {
    const result = await startLobby();
    if (result.ok) {
      update(result.value);
    } else {
      alert(`Error: ${result.error.message}`);
    }
  };

  const handleDeleteLobby = async () => {
    const result = await deleteLobby();
    if (result.ok) {
      update(null);
    } else {
      alert(`Error: ${result.error.message}`);
    }
  };

  const handleLeaveLobby = async () => {
    const result = await leaveLobby();
    if (result.ok) {
      update(null);
    } else {
      alert(`Error: ${result.error.message}`);
    }
  };

  return (
    <div>
      {user.id === lobby.host_uid ? (
        <>
          <button onClick={handleStartLobby}>start lobby</button>
          <button onClick={handleDeleteLobby}>delete lobby</button>
        </>
      ) : (
        <>
          <button onClick={handleLeaveLobby}>leave lobby</button>
        </>
      )}
    </div>
  );
}
