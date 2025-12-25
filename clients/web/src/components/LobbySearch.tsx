import { useState } from "react";
import { createLobby, joinLobby } from "../services/lobbies";
import type { LobbyPayload } from "shared";

export default function LobbySearch({
  setLobby,
}: {
  setLobby: (lobby: LobbyPayload | null) => void;
}) {
  const [code, setCode] = useState<string>("");

  const handleCreateLobby = async () => {
    try {
      const lobby = await createLobby();
      setLobby(lobby);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleJoinLobby = async () => {
    try {
      const lobby = await joinLobby(code);
      setLobby(lobby);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <>
      <h2>Make lobby</h2>
      <button onClick={handleCreateLobby}>make lobby</button>

      <h2>Join Lobby</h2>
      <input
        type="text"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
        }}
      ></input>
      <button onClick={handleJoinLobby}>join</button>
    </>
  );
}
