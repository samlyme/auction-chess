import { useState } from "react";
import { createLobby, joinLobby } from "../services/lobbies";

export default function LobbySearch() {
  const [code, setCode] = useState<string>("");

  const handleCreateLobby = async () => {
    const result = await createLobby();
    if (!result.ok) {
      alert(`Error: ${result.error.message}`);
    }
    // State will update via real-time subscription
  };

  const handleJoinLobby = async () => {
    const result = await joinLobby(code);
    if (!result.ok) {
      alert(`Error: ${result.error.message}`);
    }
    // State will update via real-time subscription
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
