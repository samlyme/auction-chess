import { useEffect, useState } from "react";
import { Lobby } from "shared";
import { getLobby } from "../services/lobbies";
import supabase from "../supabase";

export default function useLobbies() {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [subFlag, setSubFlag] = useState<number>(0);
  const resubscribe = () => setSubFlag((prev) => prev + 1);

  useEffect(() => {
    setLoading(true);
    getLobby().then((result) => {
      console.log("res", result)
      if (result.ok) {
        setLobby(result.value);
      } else {
        console.log("Error fetching lobby:", result.error);
        setLobby(null);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading || !lobby) return;

    console.log("subscribe to realtime");

    const channel = supabase.channel(`lobby-${lobby.code}`).subscribe();

    channel.on("broadcast", { event: "*" }, (update) => {
      console.log("real time", update);
      if (update.event === "delete") {
        setLobby(null);
        console.log("lobby deleted");
      } else {
        const newLobby = Lobby.parse(update.payload);
        setLobby(newLobby)
        console.log("newLobby", newLobby);
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [subFlag, loading]);

  return {
    lobby,
    loading,
    update: (lobby?: Lobby | null) => {
      if (lobby === undefined) {
        setLoading(true);
        getLobby().then((result) => {
          if (result.ok) {
            setLobby(result.value);
          } else {
            console.log("Error fetching lobby:", result.error);
            setLobby(null);
          }
          setLoading(false);
        });
        resubscribe();
      } else {
        setLobby(lobby);
      }
    },
  };
}
