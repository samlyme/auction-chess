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
    try {
      const lobby = await startLobby();
      setLobby(lobby);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDeleteLobby = async () => {
    try {
      await deleteLobby();
      setLobby(null);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleEndLobby = async () => {
    try {
      const lobby = await endLobby();
      setLobby(lobby);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleLeaveLobby = async () => {
    try {
      const lobby = await leaveLobby();
      setLobby(lobby);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div>
      {user.id === lobby.hostUid ? (
        <>
          {lobby.gameStarted ? (
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
