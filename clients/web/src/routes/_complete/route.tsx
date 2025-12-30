import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getStage, stagePath } from "../-utils/onboarding";

export const Route = createFileRoute("/_complete")({
  beforeLoad: ({ context }) => {
    const stage = getStage({
      session: context.auth.session,
      profile: context.profile.profile,
    });

    if (stage !== "complete") {
      const target = stagePath[stage];
      throw redirect({ to: target, replace: true });
    }
  },
  component: () => <Outlet />,
});
