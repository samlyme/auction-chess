import { getProfile } from '@/services/profiles';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

// TODO: cache this result. This must be done with something like Tanstack Query.
export const Route = createFileRoute('/_requireAuth/_requireProfile')({
  beforeLoad: async ({ context }) => {
    const profile = await getProfile({ id: context.auth.session.user.id });
    if (profile === null) {
      throw redirect({ to: '/auth/create-profile' });
    }
    return { profile };
  },
  component: Outlet,
});
