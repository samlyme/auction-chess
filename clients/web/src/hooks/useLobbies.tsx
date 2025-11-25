import { useEffect, useState } from "react";
import type { Tables } from "shared";
import { getLobby } from "../services/lobbies";
import supabase from "../supabase";

export default function useLobbies() {
  const [lobby, setLobby] = useState<Tables<"lobbies"> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [subFlag, setSubFlag] = useState<number>(0);
  const resubscribe = () => setSubFlag(prev => prev + 1);

  useEffect(() => {
    setLoading(true);
    getLobby().then((res) => {
      setLobby(res);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading || !lobby) return;

    console.log("subscribe to realtime");

    const channel = supabase.channel(`lobby-${lobby.code}`).on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "lobbies",
        filter: `id=eq.${lobby.id}`
      },
      (payload) => {
        const newLobby = payload.new as Tables<"lobbies">;
        console.log("realtime", newLobby);
        setLobby(newLobby.closed ? null : newLobby);
      }
    ).subscribe();

    return () => {
      channel.unsubscribe();
    }
  }, [subFlag])

  return {
    lobby,
    loading,
    update: (lobby?: Tables<"lobbies"> | null) => {
      console.log("fire update");

      if (lobby === undefined) {
        console.log('default update');
      } else {
        console.log('valued update');
        setLobby(lobby);
      }
      resubscribe();
    },
  };
}
