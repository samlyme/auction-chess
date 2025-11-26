import { useEffect, useState } from "react";
import type { Tables } from "shared";
import { getLobby } from "../services/lobbies";
import supabase from "../supabase";

export default function useLobbies() {
  const [lobby, setLobby] = useState<Tables<"lobbies"> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [subFlag, setSubFlag] = useState<number>(0);
  const resubscribe = () => setSubFlag((prev) => prev + 1);

  useEffect(() => {
    setLoading(true);
    getLobby()
      .then((res) => {
        setLobby(res);
        setLoading(false);
      })
      .catch((reason) => {
        console.log({ reason });
        setLobby(null);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || !lobby) return;

    console.log("subscribe to realtime");

    const channel = supabase.channel(`lobby-${lobby.code}`).subscribe();

    channel.on("broadcast", { event: "*" }, (payload) => {
      console.log("real time", payload);

      const newLobby = payload.payload as
        | Tables<"lobbies">
        | { deleted: boolean };
      console.log("newLobby", newLobby);
      if ("deleted" in newLobby) {
        setLobby(null);
      } else setLobby(newLobby);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [subFlag, loading]);

  return {
    lobby,
    loading,
    update: (lobby?: Tables<"lobbies"> | null) => {

      if (lobby === undefined) {
        setLoading(true);
        getLobby()
          .then((res) => {
            setLobby(res);
            setLoading(false);
          })
          .catch((reason) => {
            console.log({ reason });
            setLobby(null);
            setLoading(false);
          });
      } else {
        setLobby(lobby);
      }
      resubscribe();
    },
  };
}
