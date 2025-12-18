import { useContext } from "react";
import { AuthContext } from "../contexts/Auth";
import {
  deleteLobby,
  leaveLobby,
  startLobby,
  endLobby,
} from "../services/lobbies";
import type { LobbyPayload } from "shared";

export default function LobbyMenu({
  lobby,
  setLobby,
}: {
  lobby: LobbyPayload;
  setLobby: (lobby: LobbyPayload | null) => void;
}) {
  const { user } = useContext(AuthContext);
  if (!lobby || !user) return <h1>Loading</h1>;

  const handleStartLobby = async () => {
    const result = await startLobby();
    if (!result.ok) {
      alert(`Error: ${result.error.message}`);
    } else {
      setLobby(result.value);
    }
  };

  const handleDeleteLobby = async () => {
    const result = await deleteLobby();
    if (!result.ok) {
      alert(`Error: ${result.error.message}`);
    } else {
      setLobby(null);
    }
  };

  const handleEndLobby = async () => {
    const result = await endLobby();
    if (!result.ok) {
      alert(`Error: ${result.error.message}`);
    } else {
      setLobby(result.value);
    }
  };

  const handleLeaveLobby = async () => {
    const result = await leaveLobby();
    if (!result.ok) {
      alert(`Error: ${result.error.message}`);
    } else {
      setLobby(result.value);
    }
  };

  return (
    <div>
      {user.id === lobby.host_uid ? (
        <>
          {lobby.game_started ? (
            <button onClick={handleEndLobby}>end lobby</button>
          ) : (
            <button onClick={handleStartLobby}>start lobby</button>
          )}
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
