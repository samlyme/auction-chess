import { getProfile } from '@/services/profiles';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_requireAuth/_requireProfile')({
  beforeLoad: async ({ context }) => {
    const res = await getProfile({ id: context.auth.session.user.id });
    if (!res.ok || res.value === null) {
      throw redirect({ to: '/auth/create-profile' });
    }
    return { profile: res.value };
  },
  component: Outlet,
});
