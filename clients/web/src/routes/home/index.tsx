import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/home/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();

  return (
    <div className="h-full w-full overflow-auto bg-(--color-background)">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="mb-12 text-center text-5xl font-bold">
          Choose Your Game Mode
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Casual Match Card */}
          <div className="cursor-not-allowed rounded-xl border border-neutral-200 bg-white p-8 opacity-50 shadow-lg">
            <h2
              className="mb-4 text-3xl font-bold"
              style={{ color: 'var(--color-primary-600)' }}
            >
              Casual Match
            </h2>
            <p
              className="mb-6 text-base"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Jump into a relaxed game with no pressure. Perfect for practicing
              new strategies or playing for fun.
            </p>
            <button
              disabled
              className="w-full cursor-not-allowed rounded-lg bg-primary-500 px-6 py-3 text-base text-white"
            >
              Play Casual
            </button>
          </div>

          {/* Ranked Match Card */}
          <div className="cursor-not-allowed rounded-xl border border-neutral-200 bg-white p-8 opacity-50 shadow-lg">
            <h2
              className="mb-4 text-3xl font-bold"
              style={{ color: 'var(--color-primary-600)' }}
            >
              Ranked Match
            </h2>
            <p
              className="mb-6 text-base"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Compete against players of similar skill level. Win to climb the
              ranks and prove your mastery.
            </p>
            <button
              disabled
              className="w-full cursor-not-allowed rounded-lg bg-primary-500 px-6 py-3 text-base text-white"
            >
              Play Ranked
            </button>
          </div>

          {/* Create Lobby Card */}
          <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-lg transition-shadow hover:shadow-xl">
            <h2
              className="mb-4 text-3xl font-bold"
              style={{ color: 'var(--color-primary-600)' }}
            >
              Create Lobby
            </h2>
            <p
              className="mb-6 text-base"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Set up a private game with custom rules. Share the lobby code with
              friends to play together.
            </p>
            <button
              className="w-full rounded-lg bg-primary-500 px-6 py-3 text-base text-white transition-colors hover:bg-primary-600"
              onClick={() => navigate({ to: '/lobbies' })}
            >
              Create Lobby
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
