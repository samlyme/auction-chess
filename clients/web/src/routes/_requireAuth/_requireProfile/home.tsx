import LobbyConfigForm from "@/components/forms/LobbyConfigForm";
import {
  useJoinLobbyMutationOptions,
  useLobbyOptions,
} from "@/queries/lobbies";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Button, FormInput, Card } from "@/components/ui";

export const Route = createFileRoute("/_requireAuth/_requireProfile/home")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const lobby = await queryClient.ensureQueryData(useLobbyOptions());
    if (lobby) throw redirect({ to: "/lobbies" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const [lobbyCode, setLobbyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinLobbyMutation = useMutation(useJoinLobbyMutationOptions());

  const handleJoinLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await joinLobbyMutation.mutateAsync(lobbyCode.trim());
      navigate({ to: "/lobbies" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join lobby");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-auto bg-(--color-background)">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="relative mb-12 flex items-center justify-center">
          <h1 className="text-center text-5xl font-bold">
            Choose Your Game Mode
          </h1>
          <Link
            to="/settings"
            className="absolute right-0 rounded-lg bg-neutral-700 px-4 py-2 text-sm text-white transition-colors hover:bg-neutral-600"
          >
            Settings
          </Link>
        </div>

        <div className="grid gap-8 grid-cols-3">
          {/* Custom Lobby Card */}
          <Card className="shadow-lg">
            <h2
              className="mb-4 text-3xl font-bold"
              style={{ color: "var(--color-primary-600)" }}
            >
              Custom Lobby
            </h2>
            <p
              className="mb-6 text-base"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Create a new lobby or join an existing one with a code.
            </p>

            {/* Create Lobby Form */}
            <LobbyConfigForm isCreate={true} />

            {/* Divider */}
            <div className="m-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-neutral-600"></div>
              <span className="text-sm text-neutral-400">OR</span>
              <div className="h-px flex-1 bg-neutral-600"></div>
            </div>

            {/* Join Lobby Form */}
            <form onSubmit={handleJoinLobby} className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Join Lobby</h3>
              <FormInput
                id="lobbyCode"
                label="Lobby Code"
                type="text"
                placeholder="Enter 6-character code"
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="border-neutral-300 bg-neutral-50 px-4 py-2 text-neutral-900 uppercase"
              />
              <Button
                type="submit"
                variant="blue"
                size="lg"
                fullWidth
                loading={loading}
                loadingText="Joining..."
                disabled={lobbyCode.length !== 6}
              >
                Join Lobby
              </Button>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </form>
          </Card>
          {/* Casual Match Card */}
          <Card className="cursor-not-allowed opacity-50 shadow-lg">
            <h2
              className="mb-4 text-3xl font-bold"
              style={{ color: "var(--color-primary-600)" }}
            >
              Casual Match
            </h2>
            <p
              className="mb-6 text-base"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Jump into a relaxed game with no pressure. Perfect for practicing
              new strategies or playing for fun.
            </p>
            <Button
              disabled
              variant="blue"
              size="lg"
              fullWidth
              className="cursor-not-allowed"
            >
              Play Casual
            </Button>
          </Card>

          {/* Ranked Match Card */}
          <Card className="cursor-not-allowed opacity-50 shadow-lg">
            <h2
              className="mb-4 text-3xl font-bold"
              style={{ color: "var(--color-primary-600)" }}
            >
              Ranked Match
            </h2>
            <p
              className="mb-6 text-base"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Compete against players of similar skill level. Win to climb the
              ranks and prove your mastery.
            </p>
            <Button
              disabled
              variant="blue"
              size="lg"
              fullWidth
              className="cursor-not-allowed"
            >
              Play Ranked
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
