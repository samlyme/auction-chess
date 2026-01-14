import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import supabase from '@/supabase';
import { createProfile } from '@/services/profiles';

export const Route = createFileRoute('/auth/create-profile')({
  // TODO: redirect user off this page if profile is created.
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await createProfile({
        id: user.id,
        username,
        bio,
      });

      navigate({ to: '/lobbies' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-auto bg-(--color-background) p-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-4xl">Create Your Profile</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="mb-2 block text-base">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-base"
            />
          </div>
          <div>
            <label htmlFor="bio" className="mb-2 block text-base">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              rows={4}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-base"
            />
          </div>
          {error && <div className="mb-4 text-base text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 text-base text-white transition-colors hover:bg-blue-400 disabled:bg-neutral-400"
          >
            {loading ? 'Creating...' : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
