import { useContext, useState } from "react";
import { createLobby, joinLobby } from "../services/lobbies";
import { LobbyContext } from "../contexts/Lobby";

export default function LobbySearch() {
  const [code, setCode] = useState<string>("");
  const { update } = useContext(LobbyContext);
  return (
    <>
      <h2>Make lobby</h2>

      {/* This is such a thin wrapper, I might as well just use fetch lol */}
      <button
        onClick={async () => {
          try {
            const lobby = await createLobby();
            update(lobby);
          } catch (error) {
            console.log(
              "weird, user is already in lobby yet is on this page.",
              error,
            );
          }
        }}
      >
        make lobby
      </button>

      <h2>Join Lobby</h2>
      <input
        type="text"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
        }}
      ></input>
      <button
        onClick={async () => {
          try {
            const lobby = await joinLobby(code);
            update(lobby);
          } catch (error) {
            console.log("failed to join lobby", error);
          }
        }}
      >
        join
      </button>
    </>
  );
}
