import { LobbyCodeSearchParam } from "@/routes/-types";
import { getLobby, joinLobby } from "@/services/lobbies";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/_profile/_lobby")({
  validateSearch: LobbyCodeSearchParam,
  beforeLoad: async ({ search: { code } }) => {
    const res = await getLobby();
    if (!res.ok) {
      console.log("failed to call getLobby. You are cooked");
      throw new Error("ur cooked");
    }

    const currLobby = res.value;

    if (code) {
      if (currLobby) {
        if (code === currLobby.code) {
          return { lobby: currLobby };
        } else {
          throw redirect({ to: "/lobby/leave-old", search: { code } });
        }
      } else {
        const res = await joinLobby(code);
        if (!res.ok) {
          console.log("error joining lobby from route", res.error);
          throw redirect({ to: "/lobby" });
        }
        // TODO: catch error in joining here.
        const newLobby = res.value;
        console.log({ newLobby });
        return { lobby: newLobby };
      }
    } else {
      console.log(currLobby);

      if (currLobby) throw redirect({ to: "/lobby", search: { code: currLobby.code } });
      return { lobby: currLobby };
    }
  },
  component: () => <Outlet />,
});
