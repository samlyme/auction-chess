import { useUpdateProfileMutation } from '@/hooks/queries/profiles';
import supabase from '@/supabase';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/_requireAuth/_requireProfile/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  const profile = Route.useRouteContext().profile;
  const [bio, setBio] = useState(profile.bio);
  const updateProfileMutation = useUpdateProfileMutation();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateProfileMutation.mutateAsync({ bio });
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(`Error signing out: ${error.message}`);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="h-full w-full overflow-auto bg-(--color-background)">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-8 text-4xl font-bold">Settings</h1>

        <div className="rounded-xl border border-neutral-200 bg-neutral-800 p-8 shadow-lg">
          <h2 className="mb-6 text-2xl font-semibold">Profile</h2>

          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={profile.username}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-neutral-300 bg-neutral-600 px-4 py-2 text-base text-neutral-400"
              />
            </div>

            <div>
              <label htmlFor="bio" className="mb-2 block text-sm">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 text-base text-neutral-900"
                placeholder="Tell us about yourself..."
              />
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base text-white transition-colors hover:bg-blue-400 disabled:bg-neutral-400"
            >
              {updateProfileMutation.isPending
                ? 'Updating...'
                : 'Update Profile'}
            </button>
          </form>
        </div>

        <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-800 p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-semibold">Account</h2>
          <button
            onClick={handleSignOut}
            className="w-full rounded-lg bg-red-600 px-6 py-3 text-base text-white transition-colors hover:bg-red-400"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
