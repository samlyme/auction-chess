import { api } from '@/queries/api';
import { useCreateGuestProfileMutationOptions, useMyProfileOptions } from '@/queries/profiles';
import supabase from '@/supabase';
import { createFileRoute, redirect } from '@tanstack/react-router'
import { parseResponse } from 'hono/client';

export const Route = createFileRoute('/auth/guest-signin')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.session && !context.auth.loading) {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error("Error signing in Anonymously:", error);
        throw error;
      }
    }

    const { queryClient } = context;
    const profile = await queryClient.ensureQueryData(useMyProfileOptions());
    if (profile) throw redirect({ to: "/home" });

    const guestProfile = await parseResponse(api.profiles.guest.$post());
    queryClient.setQueryData(useMyProfileOptions().queryKey, guestProfile);
    throw redirect({ to: "/home" });
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/create-guest-profile"!</div>
}
