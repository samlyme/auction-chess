import { LobbyCodeSearchParam } from "@/routes/-types";
import { leaveLobby } from "@/services/lobbies";
import { createFileRoute, redirect } from "@tanstack/react-router";

// NOTE: Do not attempt to make this route a child route of /lobby.
// It causes an infinite loop because it will also run all of the
export const Route = createFileRoute("/_auth/_profile/_lobby/leave-old-lobby")({
  validateSearch: LobbyCodeSearchParam,
  beforeLoad: ({ context: { lobby }, search: { code } }) => {
    if (!lobby) throw redirect({ to: "/lobby", search: { code } });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  return (
    <div>
      <button
        onClick={() => {
          leaveLobby().then(() => navigate({ to: "/lobby", search }));
        }}
      >
        leave
      </button>
      <button
        onClick={() => {
          navigate({ to: "/home" }); // Cheap way to go back to the old lobby.
        }}
      >
        stay
      </button>
    </div>
  );
}
