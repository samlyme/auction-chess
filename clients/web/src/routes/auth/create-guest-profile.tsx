import { api } from '@/queries/api';
import { useCreateGuestProfileMutationOptions, useMyProfileOptions } from '@/queries/profiles';
import { createFileRoute, redirect } from '@tanstack/react-router'
import { parseResponse } from 'hono/client';

export const Route = createFileRoute('/auth/create-guest-profile')({
  beforeLoad: async ({ context }) => {
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
