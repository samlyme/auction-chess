import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { createLobby } from '@/services/lobbies';
import type { Color } from 'shared';

export const Route = createFileRoute('/_requireAuth/_requireProfile/home')({
  component: RouteComponent
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const [hostColor, setHostColor] = useState<Color>('white');
  const [timeMinutes, setTimeMinutes] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleCreateLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await createLobby({
      gameConfig: {
        hostColor,
        initTime: {
          white: timeMinutes * 60 * 1000,
          black: timeMinutes * 60 * 1000,
        },
      },
    });

    if (result.ok) {
      navigate({ to: '/lobbies' });
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="h-full w-full overflow-auto bg-(--color-background)">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="mb-12 text-center text-5xl font-bold">
          Choose Your Game Mode
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Casual Match Card */}
          <div className="cursor-not-allowed rounded-xl border border-neutral-200 bg-neutral-800 p-8 opacity-50 shadow-lg">
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
          <div className="cursor-not-allowed rounded-xl border border-neutral-200 bg-neutral-800 p-8 opacity-50 shadow-lg">
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
          <div className="rounded-xl border border-neutral-200 bg-neutral-800 p-8 shadow-lg">
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
            <form onSubmit={handleCreateLobby} className="flex flex-col gap-4">
              <div>
                <label htmlFor="hostColor" className="mb-2 block text-sm">
                  Your Color
                </label>
                <select
                  id="hostColor"
                  value={hostColor}
                  onChange={(e) => setHostColor(e.target.value as Color)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 text-base text-neutral-900"
                >
                  <option value="white">White</option>
                  <option value="black">Black</option>
                </select>
              </div>
              <div>
                <label htmlFor="timeMinutes" className="mb-2 block text-sm">
                  Time (minutes)
                </label>
                <input
                  id="timeMinutes"
                  type="number"
                  min="1"
                  max="60"
                  value={timeMinutes}
                  onChange={(e) => setTimeMinutes(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 text-base text-neutral-900"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base text-white transition-colors hover:bg-blue-400 disabled:bg-neutral-400"
              >
                {loading ? 'Creating...' : 'Create Lobby'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
