import { useContext } from "react";
import { AuthContext } from "../../contexts/Auth";
import {
  deleteLobby,
  leaveLobby,
  startLobby,
  endLobby,
} from "../../services/lobbies";
import type { LobbyPayload } from "shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LobbyMenu({
  lobby,
  setLobby,
}: {
  lobby: LobbyPayload;
  setLobby: (lobby: LobbyPayload | null) => void;
}) {
  const { user } = useContext(AuthContext);
  if (!lobby || !user) return <div>Loading...</div>;

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
    <Card>
      <CardContent className="flex gap-2 pt-6">
        {user.id === lobby.hostUid ? (
          <>
            {lobby.gameStarted ? (
              <Button variant="secondary" onClick={handleEndLobby}>End Game</Button>
            ) : (
              <Button onClick={handleStartLobby}>Start Game</Button>
            )}
            <Button variant="destructive" onClick={handleDeleteLobby}>Delete Lobby</Button>
          </>
        ) : (
          <Button variant="secondary" onClick={handleLeaveLobby}>Leave Lobby</Button>
        )}
      </CardContent>
    </Card>
  );
}
