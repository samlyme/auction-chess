import { useEffect, useState } from "react";
import { type Tables } from "../supabase";
import { getLobby } from "../services/lobbies";

export default function useLobby() {
  const [lobby, setLobby] = useState<Tables<"lobbies"> | null>(null);

  useEffect(() => {
    getLobby()
      .then((res: Tables<"lobbies"> | null) => {
        setLobby(res);
      });
  }, []);

  return lobby;
}
