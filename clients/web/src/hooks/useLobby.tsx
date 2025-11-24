import { useEffect, useState } from "react";
import supabase, { type Tables } from "../supabase";
import type { FunctionsResponse } from "@supabase/functions-js";

export default function useLobby() {
  const [lobby, setLobby] = useState<Tables<"lobbies"> | null>(null);

  useEffect(() => {
    supabase.functions
      .invoke("api/lobbies", {
        method: "GET",
      })
      .then((res: FunctionsResponse<any>) => {
        setLobby(res.data as unknown as Tables<"lobbies">);
        console.log(res);
      });
  }, []);

  return lobby;
}
