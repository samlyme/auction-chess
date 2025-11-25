import { useContext } from "react";
import { AuthContext } from "../contexts/Auth";
import { deleteLobby, leaveLobby } from "../services/lobbies";
import type { Tables } from "shared";

export default function LobbyMenu({
  lobby,
  update,
}: {
  lobby: Tables<"lobbies">;
  update: (lobby?: Tables<"lobbies"> | null) => void;
}) {
  const { user } = useContext(AuthContext);
  if (!lobby || !user) return <h1>Loading</h1>;

  return (
    <div>
      {user.id === lobby.host_uid ? (
        <>
          <button onClick={() => console.log("start lobby")}>
            start lobby
          </button>
          <button
            onClick={() => deleteLobby(lobby.code).then(() => update(null))}
          >
            delete lobby
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => leaveLobby(lobby.code).then(() => update(null))}
          >
            leave lobby
          </button>
        </>
      )}
    </div>
  );
}
