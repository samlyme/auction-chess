import { useState } from "react";
import { createLobby, joinLobby } from "../services/lobbies";
import type { LobbyPayload } from "shared";

export default function LobbySearch({
  update,
}: {
  update: (lobby?: LobbyPayload | null) => void;
}) {
  const [code, setCode] = useState<string>("");

  const handleCreateLobby = async () => {
    const result = await createLobby();
    if (result.ok) {
      update(result.value);
    } else {
      alert(`Error: ${result.error.message}`);
    }
  };

  const handleJoinLobby = async () => {
    const result = await joinLobby(code);
    if (result.ok) {
      update(result.value);
    } else {
      alert(`Error: ${result.error.message}`);
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
