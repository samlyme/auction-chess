import { getLobby } from "@/services/lobbies";
import { createFileRoute, Outlet } from "@tanstack/react-router";

// NOTE: This route is only responsible for grabbing data. Redirection should happen later.
// Think of this as a sort of "provider" of sorts.
// I would love to have this as a centralized place for routing decisions, but that just
// doesn't work :(. It leads to weird states and loops if you redirect to the current location.
export const Route = createFileRoute("/_auth/_profile/_lobby")({
  // validateSearch: LobbyCodeSearchParam,
  beforeLoad: async () => {
    const res = await getLobby();
    if (!res.ok) {
      console.log("failed to call getLobby. You are cooked");
      throw new Error("ur cooked");
    }

    const currLobby = res.value;
    return { lobby: currLobby };
  },
  component: () => <Outlet />,
});
