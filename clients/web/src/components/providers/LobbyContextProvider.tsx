import { useContext, useEffect, useState } from "react";
// TODO: use import from shared
import type { Tables } from "shared";
import { AuthContext } from "../../contexts/Auth";
import { getLobby } from "../../services/lobbies";
import { LobbyContext } from "../../contexts/Lobby";
import supabase from "../../supabase";

export default function LobbyContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lobby, setLobby] = useState<Tables<"lobbies"> | null>(null);
  const { session, loading: authLoading } = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [prevTime, setPrevTime] = useState<number | null>(null);

  useEffect(() => {
    if (!session || authLoading) return;

    (async () => {
      setLoading(true);
      const res = await getLobby();
      setLobby(res);
      setLoading(false);
    })();
  }, [session, authLoading, prevTime]);

  useEffect(() => {
    if (!lobby) return;

    // NOTE: Delete operations are not filterable, so i need to do a workaround
    // that soft deletes it.
    const channel = supabase.channel(`lobby-${lobby.code}`).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "lobbies",
        filter: `id=eq.${lobby.id}`
      },
      (payload) => {
        console.log("real time", payload.new);
        setLobby(payload.new as Tables<"lobbies">);
      },
    ).subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [loading])

  return (
    <LobbyContext
      value={{
        lobby,
        update: (val = null) => {
          if (val) setLobby(val);
          else setPrevTime(Date.now());
        },
        loading,
      }}
    >
      {children}
    </LobbyContext>
  );
}
