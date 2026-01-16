import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_requireAuth")({
  beforeLoad: ({ context }) => {
    if (!context.auth.session) throw redirect({ to: "/auth" });
    return { auth: { session: context.auth.session } };
  },
  component: Outlet,
});
