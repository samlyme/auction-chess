import { getProfile } from "@/services/profiles";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/_profile")({
  beforeLoad: async ({ location }) => {
    const res = await getProfile();
    if (!res.ok)
      throw redirect({
        to: "/auth/create-profile",
        search: { redirect: location.href },
      });
    return { profile: res.value };
  },
  component: () => <Outlet />,
});
